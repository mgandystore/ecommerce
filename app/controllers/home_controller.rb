class HomeController < ApplicationController
  def index
    @product = Product
                 .includes(:product_variants)
                 .order(id: :desc)
                 .first

    @images = {
      product_images: @product.images.map(&method(:to_image))
    }

    @product.product_variants.each do |variant|
      variant.images.each do |image|
        @images[variant.variants_slug] ||= []
        @images[variant.variants_slug] << to_image(image)
      end
    end
  end

  def to_image(image)
    {
      url: Rails.application.routes.url_helpers.attachment_url(image.id, quality: 100),
      url_thumb: Rails.application.routes.url_helpers.attachment_url(image.id, resize_to_limit_width: 100),
      url_normal: Rails.application.routes.url_helpers.attachment_url(image.id, resize_to_limit_width: 1000),
      alt: "none"
    }
  end
end
