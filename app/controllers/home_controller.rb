class HomeController < ApplicationController
  def api_settings
    setting = Setting.first
    render json: {
      setting: setting
    }
  end

  def api_home
    @product = Product
                 .includes(:product_variants)
                 .order(id: :desc)
                 .first

    @product.product_variants.sort_by { |variant| variant.variants_slug }

    @images = {
      product_images: @product.ordered_images.map { |image| to_image(@product.id, image) }
    }

    @product.product_variants.each do |variant|
      variant.ordered_images.each do |image|
        @images[variant.variants_slug] ||= []
        @images[variant.variants_slug] << to_image(variant.id, image)
      end
    end

    @default_variant = find_default_variant(@product.product_variants.to_a, params)

    @product.faq.sort_by { |element| element["position"] }
    @product.specifications.sort_by { |element| element["position"] }
    @reviews = Review.where(validated: true).order(created_at: :desc)
    @setting = Setting.first

    preview_image_path = ActionController::Base.helpers.image_path("preview_image.png")

    og = JSON.parse(@setting.og)
    twitter = JSON.parse(@setting.twitter)

    og["type"] = "product" unless og["type"].present?
    og["title"] = "#{@product.name} | #{@setting.shop_name}" unless og["title"]
    og["description"] = @product.short_description unless og["description"]
    og["url"] = Rails.application.routes.url_helpers.home_url unless og["url"]
    og["image"] = preview_image_path unless og["image"]
    og["image_width"] = "600" unless og["image_width"]
    og["image_height"] = "450" unless og["image_height"]
    og["site_name"] = @setting.shop_name unless og["site_name"]
    og["price"] = {
      amount: (@product.base_price / 100).to_s,
      currency: "EUR"
    } unless og["price"]
    og["availability"] = @product.in_stock? ? "instock" : "oos" unless og["availability"]

    # Configuration des meta tags Twitter
    twitter["card"] = "product" unless twitter["card"].present?
    twitter["title"] = "#{@product.name} | #{@setting.shop_name}" unless twitter["title"]
    twitter["description"] = @product.short_description unless twitter["description"]
    twitter["image"] = preview_image_path unless twitter["image"]
    twitter["site"] = Rails.application.routes.url_helpers.home_url unless twitter["site"]
    twitter["data1"] = (@product.base_price / 100).to_s + " EUR" unless twitter["data1"]
    twitter["label1"] = "Prix" unless twitter["label1"]
    twitter["data2"] = @product.in_stock? ? "En stock" : "Rupture de stock" unless twitter["data2"]
    twitter["label2"] = "Disponibilité" unless twitter["label2"]

    render json: {
      product: @product,
      images: @images,
      product_variants: @product.product_variants,
      default_variant_id: @default_variant.id,
      reviews: @reviews,
      setting: @setting,
      seo: {
        description: @setting.short_desc,
        keywords: @setting.keywords,
        image_src: preview_image_path,
        og: og,
        twitter: twitter
      }
    }
  end

  def api_sales_terms
    @setting = Setting.first
    @cgv = replace_variables(@setting.cgv)

    render json: {
      setting: @setting,
      value: @cgv
    }
  end

  def api_legal_notices
    @setting = Setting.first
    @legal_notices = replace_variables(@setting.legal_notices)

    render json: {
      setting: @setting,
      value: @legal_notices
    }
  end

  private

  def replace_variables(content)
    return content if content.blank?

    setting = Setting.first
    html_content = content.to_s

    # Replace variables with actual values
    replacements = {
      "{{contact_mail}}" => setting.contact_mail,
      "{{siret}}" => setting.siret,
      "{{siren}}" => setting.siren,
      "{{address}}" => setting.address
    }

    replacements.each do |variable, value|
      html_content = html_content.gsub(variable, value.to_s) if value.present?
    end

    html_content
  end

  def to_image(id, image)
    {
      url: Rails.application.routes.url_helpers.attachment_url(record_id: id, id: image.id),
      url_medium: Rails.application.routes.url_helpers.attachment_url(record_id: id, id: image.id, variant: :medium),
      url_thumbnail: Rails.application.routes.url_helpers.attachment_url(record_id: id, id: image.id, variant: :thumbnail),
      url_large: Rails.application.routes.url_helpers.attachment_url(record_id: id, id: image.id, variant: :large),
      url_blur: Rails.application.routes.url_helpers.attachment_url(record_id: id, id: image.id, variant: :blur),
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
