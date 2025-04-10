class ProductVariant < ApplicationRecord
  include PositionableImages

  has_many_attached :images do |attachment|
    attachment.variant :thumbnail, resize_to_limit: [200, nil]
    attachment.variant :medium, resize_to_limit: [500, nil]
    attachment.variant :large, resize_to_limit: [1000, nil]
    attachment.variant :blur, blur: 10, resize_to_limit: [10, nil]
  end

  belongs_to :product

  # human format is Key Value / Key Value
  # sorted by key to have the same order
  def human_format
    variants.sort_by { |k, _v| k }.map { |k, v| "#{k} #{v}" }.join(" / ")
  end


  def image_urls(variants = [])
    images_array = []

    # First add this variant's images
    ordered_images.each do |image|
      image_hash = {}
      variants.each do |variant|
        image_hash["url_#{variant}"] = Rails.application.routes.url_helpers.attachment_url(
          record_id: id,
          id: image.id,
          variant: variant
        )
      end
      images_array << image_hash
    end

    # Then add product images
    product.ordered_images.each do |image|
      image_hash = {}
      variants.each do |variant|
        image_hash["url_#{variant}"] = Rails.application.routes.url_helpers.attachment_url(
          record_id: product.id,
          id: image.id,
          variant: variant
        )
      end
      images_array << image_hash
    end

    images_array
  end

  def create_image_variants
    ::CreateImageVariantsJob.perform_later(record_type: ProductVariant.name, record_id: id)
  end

  def total_price
    self.product.base_price + (self.additional_price.presence || 0)
  end
end
