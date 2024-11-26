class Product < ApplicationRecord
  has_many_attached :images
  has_many :product_variants
  after_create_commit :create_stripe_products

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
      description: params[:product][:description],
      specifications: params[:product][:specifications] || {},
      features: params[:product][:features] || {},
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
end