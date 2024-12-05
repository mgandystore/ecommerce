json.product do
  json.id @product.id.to_s
  json.name @product.name
  json.description @product.description
  json.specifications @product.specifications
  json.features @product.features
  json.base_price @product.base_price
  json.created_at @product.created_at
  json.updated_at @product.updated_at
  json.images @product.images do |image|
    json.url image.url
    json.byte_size image.byte_size
    json.created_at image.created_at
    json.content_type image.content_type
  end

  json.variants @product.product_variants do |variant|
    json.extract! variant, :variants, :variants_slug, :additional_price
    json.id variant.id.to_s
    json.images variant.images do |image|
      json.url image.url
      json.byte_size image.byte_size
      json.created_at image.created_at
      json.content_type image.content_type
    end
  end
end
