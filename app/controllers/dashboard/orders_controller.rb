module Dashboard
  class OrdersController < BaseController
    def index
      @orders = orders_scope
                  .includes(:customer, :order_notes, :shipping_address, order_items: [:product_variant, :product])
                  .order(Arel.sql("paid_at IS NULL ASC"))
                  .order(Arel.sql("paid_at DESC NULLS LAST"))
                  .order(id: :desc)

      # Count order paid at not null
      @total_orders = Order.where.not(paid_at: nil).count

      @orders_this_month = Order.where.not(paid_at: nil).where("created_at >= ?", Time.current.beginning_of_month).count

      # Average shipping duration for paid and shipped orders
      @avg_shipping_duration = Order.where.not(paid_at: nil)
                                    .where.not(shipped_at: nil)
                                    .average("EXTRACT(EPOCH FROM shipped_at - paid_at)").to_i

      # Best variant calculation - only considering paid orders and factoring in quantity
      best_variant = OrderItem
                       .joins(:order)
                       .where.not(orders: { paid_at: nil })
                       .select("product_variant_id, SUM(quantity) as total_quantity")
                       .group(:product_variant_id)
                       .order("total_quantity DESC")
                       .limit(1)
                       .first

      @best_variant = best_variant ? {
        name: ProductVariant.find(best_variant.product_variant_id).human_format,
        sales_count: best_variant.total_quantity
      } : nil

      # Add additional useful statistics
      @revenue_this_month = OrderItem
                              .joins(:order)
                              .where(orders: { status: "paid" })
                              .where("orders.created_at >= ?", Time.current.beginning_of_month)
                              .sum(:total_amount)
    end

    def show
      @order = Order
                 .includes(:customer, :order_notes, :shipping_address, :promo_code_usages, order_items: [:product_variant, :product])
                 .find_by!(id: params[:id])

      @price = @order.compute_pricing
    end

    def update
      @order = Order.find(params[:id])

      if Order.statuses.include?(order_params[:status])
        @order.status = order_params[:status]

        if @order.status == "shipped"
          @order.carrier_tracking_number = order_params[:carrier_tracking_number] if order_params[:carrier_tracking_number].present?
          @order.carrier_name = order_params[:carrier_name] if order_params[:carrier_name].present?
          @order.carrier_tracking_link = order_params[:carrier_tracking_link] if order_params[:carrier_tracking_link].present?
        end

        @order.save

        if @order.status == "shipped"
          OrderMailer.order_shipped(@order.id).deliver_later
        end

        flash[:success] = "L'état de la commande a été mis à jour avec succès"
      end

      if order_params[:notes].present?
        @order.order_notes.create(content: order_params[:notes])
        flash[:success] = "La note d'informations a été ajoutée avec succès"
      end


      redirect_to dashboard_order_path(@order)
    end

    def send_review_request
      @order = Order.find(params[:id])

      # Create or find existing review for this order
      review = @order.review || Review.create!(
        order_id: @order.id,
        name: @order.customer.full_name,
        content: nil,
        stars: nil,
        validated: false
      )

      OrderMailer.request_review(@order.id).deliver_later
      flash[:success] = "L'email de demande d'avis a été envoyé au client"
      redirect_to dashboard_order_path(@order)
    end

    def laposte_expedition_template
      require "csv"

      @order = Order.includes(:customer, :shipping_address).find_by!(id: params[:id])

      name_parts = @order.customer.full_name.split(" ", 2)
      first_name = name_parts[0] || ""
      last_name = name_parts[1] || ""

      filename = generate_filename(first_name, last_name, @order.id)

      # Create CSV data
      csv_data = CSV.generate(headers: true) do |csv|
        # Add headers based on the template
        csv << [
          "recipient_first_name",
          "recipient_last_name",
          "recipient_company",
          "recipient_address_line_1",
          "recipient_address_line_2",
          "recipient_postal_code",
          "recipient_city",
          "recipient_country_iso_code",
          "recipient_additional_information",
          "recipient_phone",
          "recipient_email",
          "recipient_proximity_point",
          "content_detailed_description",
          "content_category_code",
          "package_1_weight",
          "package_1_length",
          "package_1_width",
          "package_1_height",
          "package_1_value",
          "external_reference"
        ]

        # Split customer full name into first and last name



        # Get order items description
        order_items_description = @order.order_items.map do |item|
          "#{item.product.name} - #{item.product_variant.human_format} (x#{item.quantity})"
        end.join(", ")

        # Calculate total order value in euros (cents / 100)
        order_value = (@order.order_items.sum(&:total_amount) / 100.0).round(2).to_s

        csv << [
          first_name, # recipient_first_name
          last_name, # recipient_last_name
          "", # recipient_company
          @order.shipping_address.address_line1, # recipient_address_line_1
          @order.shipping_address.address_line2, # recipient_address_line_2
          @order.shipping_address.postal_code, # recipient_postal_code
          @order.shipping_address.city, # recipient_city
          @order.shipping_address.country, # recipient_country_iso_code
          "", # recipient_additional_information
          @order.customer.phone, # recipient_phone
          @order.customer.email, # recipient_email
          if @order.shipping_address.pickup_point?
            # CHRP-FR-1165Y
            "CHRP-#{@order.shipping_address.country.upcase}-#{@order.shipping_address.pickup_point_id}"
          else
             ""
          end,
          order_items_description, # content_detailed_description
          "50350", # content_category_code
          "0.1", # package_1_weight
          "15.2", # package_1_length
          "22.8", # package_1_width
          "5", # package_1_height
          order_value, # package_1_value
          @order.id # external_reference
        ]
      end

      send_data csv_data,
                type: "text/csv; charset=utf-8; header=present",
                disposition: "attachment; filename=#{filename}"
    end

    private

    def slugify(text)
      text.downcase.strip.gsub(/\s+/, "-").gsub(/[^\w-]/, "")
    end

    def generate_filename(first_name, last_name, order_id)
      slugged_first_name = slugify(first_name)
      slugged_last_name = slugify(last_name)
      date = Date.today.strftime("%Y%m%d")

      "#{slugged_first_name}_#{slugged_last_name}_#{date}_#{order_id}.csv"
    end

    def order_params
      params.require(:order).permit(:status, :notes, :carrier_tracking_number, :carrier_name, :carrier_tracking_link)
    end

    def orders_scope
      scope = Order

      if params[:query].present?
        query = params[:query].strip.downcase
        scope = scope.joins(:customer, :shipping_address)
                     .where(
                       "LOWER(customers.email) LIKE :query OR
           LOWER(customers.full_name) LIKE :query OR
           LOWER(addresses.address_line1) LIKE :query OR
           LOWER(addresses.city) LIKE :query OR
           EXISTS (
             SELECT 1 FROM order_items oi
             INNER JOIN product_variants pv ON pv.id = oi.product_variant_id
             WHERE oi.order_id = orders.id
             AND LOWER(pv.variants_slug) LIKE :query
           )",
                       query: "%#{query}%"
                     )
      end
      scope = scope.where(status: params[:status]) if params[:status].present?

      scope
    end
  end
end
