module Dashboard
  class OrdersController < BaseController
    def index
      @orders = orders_scope
                  .includes(:customer, :order_notes, :shipping_address, order_items: [:product_variant, :product])
                  .order(id: :desc)

      @total_orders = Order.count

      @orders_this_month = Order.where('created_at >= ?', Time.current.beginning_of_month).count

      # Average shipping duration for shipped orders
      @avg_shipping_duration = Order.where.not(paid_at: nil)
                                    .where.not(shipped_at: nil)
                                    .average("EXTRACT(EPOCH FROM shipped_at - paid_at)").to_i

      best_variant = OrderItem
                       .group(:product_variant_id)
                       .order(Arel.sql('COUNT(*) DESC'))
                       .limit(1)
                       .count
                       .first

      @best_variant = best_variant ? {
        name: ProductVariant.find(best_variant[0]).human_format,
        sales_count: best_variant[1]
      } : nil

    end

    def show
      @order = Order
                 .includes(:customer, :order_notes, :shipping_address, order_items: [:product_variant, :product])
                 .find_by!(id: params[:id])

      # create 3 statistic on orders
      # total amount of order
      # avg delay between status paid and shipped
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

    private

    def order_params
      params.require(:order).permit(:status, :notes, :carrier_tracking_number, :carrier_name, :carrier_tracking_link)
    end

    def orders_scope
      puts "params: #{params.inspect}"

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
