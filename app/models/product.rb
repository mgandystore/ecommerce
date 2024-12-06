class Product < ApplicationRecord
  include PositionableImages

  has_many_attached :images do |attachment|
    attachment.variant :thumbnail, resize_to_limit: [200, nil]
    attachment.variant :medium, resize_to_limit: [500, nil]
    attachment.variant :large, resize_to_limit: [1000, nil]
    attachment.variant :blur, blur: 32, resize_to_limit: [16, nil]
  end

  after_create_commit :create_stripe_products

  has_many :product_variants

  def create_stripe_products
    CreateStripeProductJob.perform_later(self.id)
  end

  def variants_map
    product_variants.each_with_object({}) do |variant, map|
      variant.variants.each do |key, value|
        map[key] ||= []
        map[key] << value
      end
    end.transform_values(&:uniq)
  end

  def self.from_params(params)
    product = create!(
      name: params[:product][:name],
      base_price: params[:product][:base_price] || 0
    )

    if params[:variants].present?
      variants_from_parms(params, product)
    end

    product
  end

  def self.variants_from_parms(params, product)
    variants_by_name = params[:variants].group_by { |v| v[:name] }

    # Generate all possible combinations
    combinations = if variants_by_name.size == 1
                     variants_by_name.values.first.map { |variant| [variant] }
                   else
                     variants_by_name.values.inject { |acc, values| acc.product(values).map(&:flatten) }
                   end || []

    combinations.each do |combo|
      variants = {}
      slug_parts = []

      combo.each do |variant|
        variants[variant[:name]] = variant[:value]
        slug_parts << "#{variant[:name]}_#{variant[:value]}"
      end

      slug_parts.sort!

      ProductVariant.create!(
        product: product,
        variants: variants,
        variants_slug: slug_parts.join("_"),
        additional_price: combo.sum { |v| (v[:additional_price] || 0).to_i },
      )
    end
  end

  def create_image_variants
    return unless images.attached?
    ::CreateImageVariantsJob.perform_later({ record_type: self.class, record_id: id })
  end
end
