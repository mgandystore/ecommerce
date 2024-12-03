class ProductsController < ApplicationController
  skip_before_action :verify_authenticity_token

  def show
    @product = Product.includes(:product_variants).find(params[:id])
    render :product, status: :ok, formats: [:json], content_type: "application/json"
  end
end
