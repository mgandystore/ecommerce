class ProductsController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    ActiveRecord::Base.transaction do
      @product = Product.from_params(params)
      render :product, status: :created, formats: [:json], content_type: "application/json"
    rescue ActiveRecord::RecordInvalid => e
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end

  def show
    @product = Product.includes(:product_variants).find(params[:id])
    render :product, status: :ok, formats: [:json], content_type: "application/json"
  end

  def add_product_images
    @product = Product.find(params[:id])

    params[:images].each do |image|
      if image.content_type.start_with?("image/")
        @product.images.attach(image)
      end
    end
  end

  def add_product_variant_images
    @product_variant = ProductVariant.find(params[:id])
    params[:images].each do |image|
      if image.content_type.start_with?("image/")
        @product_variant.images.attach(image)
      end
    end
  end
end
