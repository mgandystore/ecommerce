module Dashboard
  class ProductsController < BaseController
    skip_before_action :verify_authenticity_token, only: [ :create ]

    def index
      @products = products_scope
                    .includes(images_attachments: :blob)
                    .includes(:product_variants)
                    .order(created_at: :desc)
    end

    def show
      @product = Product
                   .includes(images_attachments: :blob)
                   .includes(:product_variants)
                   .find_by!(id: params[:id])

      @default_images_positions = @product.images_positions
      @ordered_images = @product.ordered_images
      @product.faq.sort_by { |element| element["position"] }
      @product.specifications.sort_by { |element| element["position"] }
    end

    def create
      ActiveRecord::Base.transaction do
        @product = Product.from_params(params)
        render :product, status: :created, formats: [:json], content_type: "application/json"
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.message }, status: :unprocessable_entity
      end
    end

    def update
      @product = Product.find(params[:id])

      if product_params[:name].present?
        @product.name = product_params[:name]
      end

      if product_params[:short_description].present?
        @product.short_description = product_params[:short_description]
      end

      if product_params[:base_price].present?
        @product.base_price = product_params[:base_price].to_i * 100
      end

      if product_params[:description].present?
        @product.description = product_params[:description]
      end

      if params[:product][:images_to_delete].present?
        @product.images.where(id: params[:product][:images_to_delete]).delete_all
      end

      if product_params[:images].present?
        @product.attach_images_with_positions(product_params[:images], product_params[:images_positions])
        @product.create_image_variants
      end

      if @product.changed? || product_params[:images].present? || params[:product][:images_to_delete].present?
        @product.save
        Product::UpdateStripeProductJob.perform_later({ product_id: @product.id })
        flash[:success] = "Les informations du produit ont été mises à jour avec succès"
      end

      redirect_to dashboard_product_path(@product)
    end

    def edit_product_variants
      product_variant_id = params[:product_variant_id]
      @product = Product.find(params[:id])
      @product_variant = @product.product_variants.find(product_variant_id)
      @default_images_positions = @product_variant.images_positions
      @ordered_images = @product_variant.ordered_images
    end

    def update_product_variant
      @product = Product.find(params[:id])
      @product_variant = @product.product_variants.find(params[:product_variant_id])

      if product_variant_params[:images].present?
        @product_variant.attach_images_with_positions(product_variant_params[:images], product_variant_params[:images_positions])
        @product_variant.create_image_variants
      end

      if product_variant_params[:images_to_delete].present?
        @product_variant.images.where(id: params[:product_variant][:images_to_delete]).delete_all
      end

      if product_variant_params[:stock].present?
        stock_before = @product_variant.stock
        @product_variant.stock = product_variant_params[:stock].to_i
        if stock_before < @product_variant.stock
          puts "stock changed. sending notification"
          StockNotificationMailer.send_stock_notifications(@product_variant.id)
        end
      end

      if product_variant_params[:additional_price].present?
        @product_variant.additional_price = product_variant_params[:additional_price].to_i * 100
      end

      if @product_variant.changed? || product_variant_params[:images].present? || params[:product_variant][:images_to_delete].present?
        @product_variant.save
        Product::UpdateStripeProductJob.perform_later({ product_id: @product.id, variant_id: @product_variant.id })
        flash[:success] = "Les informations de la variante ont été mises à jour avec succès"
      end

      redirect_to dashboard_product_path(@product)
    end

    def edit_specifications
      @product = Product.find(params[:id])
      @product.specifications.sort_by { |element| element["position"] }
    end

    def edit_faq
      @product = Product.find(params[:id])
      @product.faq.sort_by { |element| element["position"] }
    end

    def update_specifications
      positions = JSON.parse(params[:positions].to_s, symbolize_names: true)
      update_structured_attribute(:specifications, positions: positions)
    end

    def update_faq
      positions = JSON.parse(params[:positions].to_s, symbolize_names: true)
      update_structured_attribute(:faq, positions: positions)
    end

    private

    def update_structured_attribute(attribute, positions:)
      @product = Product.find(params[:id])
      structured_data = []

      if params[attribute].present?
        params[attribute].each do |item|
          next if item[:key].blank? && item[:value].blank?

          structured_data << {
            key: item[:key],
            value: item[:value],
            id: item[:id],
            position: positions.find { |pos| pos[:id] == item[:id].to_s }&.dig(:position)
          }
        end
      end

      @product.update(attribute => structured_data)

      success_messages = {
        specifications: "Les spécifications ont été mises à jour avec succès",
        faq: "La FAQ a été mise à jour avec succès"
      }

      flash[:success] = success_messages[attribute]
      redirect_to dashboard_product_path(@product)
    end

    private

    def product_params
      params.require(:product).permit(:images_positions, :base_price, :short_description,
                                      :name, :description, specifications: {}, faq: {}, images: [], images_to_delete: [])
    end

    def product_variant_params
      params.require(:product_variant).permit(:images_positions, :stock, :additional_price, images: [], images_to_delete: [])
    end

    def products_scope
      scope = Product

      if params[:query].present?
        query = params[:query].strip.downcase
        scope = scope.where(
          "LOWER(products.name) LIKE :query OR
           LOWER(products.description) LIKE :query OR
           EXISTS (
             SELECT 1 FROM product_variants pv
             WHERE pv.product_id = products.id
             AND LOWER(pv.variants_slug) LIKE :query
           )",
          query: "%#{query}%"
        )
      end

      scope
    end
  end
end


