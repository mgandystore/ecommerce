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

      if params[:product][:images_to_delete].present?
        @product.images.where(id: params[:product][:images_to_delete]).delete_all
      end



      if product_params[:images].present?
        @product.images.attach(product_params[:images])
      end

      if @product.changed? || product_params[:images].present? || params[:product][:images_to_delete].present?
        @product.save
        flash[:success] = "Les informations du produit ont été mises à jour avec succès"
      end

      redirect_to dashboard_product_path(@product)
    end

    def edit_specifications
      @product = Product.find(params[:id])
    end

    def update_specifications
      @product = Product.find(params[:id])

      specifications = {}

      if params[:specifications].present?
        params[:specifications].each do |spec|
          next if spec[:key].blank? && spec[:value].blank?
          specifications[spec[:key]] = spec[:value]
        end
      end

      @product.update(specifications: specifications)

      flash[:success] = "Les spécifications ont été mises à jour avec succès"
      redirect_to dashboard_product_path(@product)
    end

    def edit_faq
      @product = Product.find(params[:id])
    end

    def update_faq
      @product = Product.find(params[:id])

      faq = {}

      if params[:faq].present?
        params[:faq].each do |item|
          next if item[:key].blank? && item[:value].blank?
          faq[item[:key]] = item[:value]
        end
      end

      @product.update(faq: faq)

      flash[:success] = "La FAQ a été mise à jour avec succès"
      redirect_to dashboard_product_path(@product)
    end

    private

    def product_params
      params.require(:product).permit(:name, :description, specifications: {}, faq: {}, images: [], images_to_delete: [])
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