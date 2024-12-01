class Product
  class UpdateStripeProductJob < ApplicationJob
    queue_as :default

    def perform(params)
      @product = Product.find(params[:product_id])

      variants = if params[:variant_id].present?
                   [ProductVariant.find(params[:variant_id])]
                 else
                   @product.product_variants
                 end

      variants.each do |variant|
        stripe_product = Stripe::Product.retrieve(variant.stripe_product_id)
        stripe_product_price = Stripe::Price.retrieve(variant.stripe_product_price_id)
        update_product(stripe_product, stripe_product_price, @product, variant)
      end
    end

    def update_product(stripe_product, stripe_product_price, product, variant)
      update_product_params = {
        name: product.name + " " + variant.human_format,
        description: ActionView::Base.full_sanitizer.sanitize(product.description)
      }

      change_price = @product.base_price + variant.additional_price != stripe_product_price.unit_amount

      if change_price
        new_stripe_product_price = Stripe::Price.create(
          unit_amount: @product.base_price + variant.additional_price,
          currency: "eur",
          product: stripe_product.id,
          active: true
        )
        update_product_params[:default_price] = new_stripe_product_price.id
        variant.stripe_product_price_id = new_stripe_product_price.id
      end

      images = (
        product.images.map { |image| Rails.application.routes.url_helpers.attachment_url(record_id: product.id, id: image.id, variant: :medium) }.first(3) +
          variant.images.map { |image| Rails.application.routes.url_helpers.attachment_url(record_id: product.id, id: image.id, variant: :medium) }
      ).first(8)

      update_product_params[:images] = images.reverse

      Stripe::Product.update(stripe_product.id, update_product_params)
      if change_price
        Stripe::Price.update(stripe_product_price.id, { active: false })
        variant.save!
      end
    end
  end
end
