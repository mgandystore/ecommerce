class HomeController < ApplicationController
  def index
    @product = Product
                 .includes(:product_variants)
                 .order(id: :desc)
                 .first

    @images = {
      product_images: @product.images.map { |image| { url: image.url, alt: image.url } }
    }

    @product.product_variants.each do |variant|
      variant.images.each do |image|
        @images[variant.variants_slug] ||= []
        @images[variant.variants_slug] << { url: image.url, alt: image.url }
      end
    end
  end
end
