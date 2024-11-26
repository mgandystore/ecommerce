module Dashboard
  class ProductsController < BaseController
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
    end

    def update
      @product = Product.find(params[:id])

      if product_params[:name].present?
        @product.name = product_params[:name]
      end

      if product_params[:description].present?
        @product.description = product_params[:description]
      end

      if @product.changed?
        @product.save
        flash[:success] = "Les informations du produit ont été mises à jour avec succès"
      end

      redirect_to dashboard_product_path(@product)
    end

    private

    def product_params
      params.require(:product).permit(:name, :description)
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