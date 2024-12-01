class HomeController < ApplicationController
  def index
    @product = Product
                 .includes(:product_variants)
                 .order(id: :desc)
                 .first

    @images = {
      product_images: @product.images.map { |image| to_image(@product.id, image) }
    }

    @product.product_variants.each do |variant|
      variant.images.each do |image|
        @images[variant.variants_slug] ||= []
        @images[variant.variants_slug] << to_image(variant.id, image)
      end
    end
  end

  def to_image(id, image)
    {
      url: Rails.application.routes.url_helpers.attachment_url(record_id: id, id: image.id),
      url_medium: Rails.application.routes.url_helpers.attachment_url(record_id: id, id: image.id, variant: :medium),
      url_thumb: Rails.application.routes.url_helpers.attachment_url(record_id: id, id: image.id, variant: :thumbnail),
      url_large: Rails.application.routes.url_helpers.attachment_url(record_id: id, id: image.id, variant: :large),
      alt: "none"
    }
  end
end
