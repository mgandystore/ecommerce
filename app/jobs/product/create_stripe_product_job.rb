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
        stripe_product = Stripe::Product.create(
          name: @product.name + variant.human_format,
          description: @product.description,
          shippable: true,
          default_price_data: {
            unit_amount: @product.base_price + variant.additional_price,
            currency: "eur"
          },
          metadata: { product_id: @product.id , variant_id: variant.id }
        )

        puts "Creating price for #{stripe_product.inspect}"
        variant.update!(
          stripe_product_id: stripe_product.id,
          stripe_product_price_id: stripe_product.default_price
        )
      end
    end
  end
end


