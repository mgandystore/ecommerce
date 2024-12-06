class Product
  class CreateStripeProductJob < ApplicationJob
    queue_as :default

    def perform(product_id)
      @product = Product.includes(:product_variants).find(product_id)

      ActiveRecord::Base.transaction do
        begin
          create_stripe_product_with_prices
        rescue Stripe::StripeError => e
          Rails.logger.error "Stripe Error: #{e.message}"
          raise ActiveRecord::Rollback
        end
      end
    end

    private

    def create_stripe_product_with_prices
      @product.product_variants.each do |variant|

        puts "DEBUG create_stripe_product_with_prices: #{variant.inspect} #{@product.inspect}"

        stripe_product = Stripe::Product.create(
          name: @product.base_price + " " + variant.additional_price,
          description: product.short_description,
          shippable: true,
          default_price_data: {
            unit_amount: @product.base_price.to_i + variant.additional_price.to_i,
            currency: "eur"
          },
          metadata: { product_id: @product.id, variant_id: variant.id }
        )

        variant.update!(
          stripe_product_id: stripe_product.id,
          stripe_product_price_id: stripe_product.default_price
        )

        Rails.logger.info "Stripe Product created: #{stripe_product.id} for product: #{product.id} and variant: #{variant.variants_slug}"
      end
    end
  end
end


