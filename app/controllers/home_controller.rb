class HomeController < ApplicationController
  def index
    @product = Product
                 .includes(:product_variants)
                 .order(id: :desc)
                 .first

    @images = {
      product_images: @product.images.map { |image| to_image(@product.id, image) }
    }

    @product.product_variants.sort_by { |variant| variant.variants_slug }

    @product.product_variants.each do |variant|
      variant.images.each do |image|
        @images[variant.variants_slug] ||= []
        @images[variant.variants_slug] << to_image(variant.id, image)
      end
    end


    @default_variant = find_default_variant(@product.product_variants.to_a, params)
    puts "debug #{@default_variant.variants["couleur"]}"
  end

  def success
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

  def find_default_variant(variants, params)
    # Try to find variant by URL parameters
    if params[:variant].present?
      variant_criteria = parse_variant_params(params[:variant])
      variant = variants.find do |v|
        variant_criteria.all? { |key, value| v.variants[key] == value }
      end
      return variant if variant
    end

    # Find first variant with stock
    variant_with_stock = variants.find { |v| v.stock.to_i > 0 }
    return variant_with_stock if variant_with_stock

    # Fallback to first variant
    variants.first
  end

  def parse_variant_params(variant_string)
    return {} unless variant_string

    variant_string.split(",").each_with_object({}) do |pair, hash|
      key, value = pair.split(":")
      hash[key] = value if key && value
    end
  end
end
