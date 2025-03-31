class CheckoutController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_cors_headers

  def create
    variant = ProductVariant.includes(:product).find_by(id: params[:product_variant_id])
    if variant.nil?
      return render json: { error: "product variant not found" }, status: :not_found
    end

    # Use a transaction to ensure stock check and update are atomic
    ProductVariant.transaction do
      # Re-query to get fresh data and lock the row
      variant.reload.lock!

      if variant.stock == 0
        return render json: { error: "product variant out of stock" }, status: :not_found
      end

      begin
        session = Stripe::Checkout::Session.create(
          success_url: ENV.fetch("FRONT_URL") + "/checkout/success",
          cancel_url: ENV.fetch("FRONT_URL"),
          payment_method_types: ["card"],
          shipping_address_collection: {
            allowed_countries: %w[FR]
          },
          locale: "fr",
          customer_creation: "always",
          phone_number_collection: { enabled: true },
          line_items: [{
                         price: variant.stripe_product_price_id,
                         quantity: 1
                       }],
          currency: "eur",
          mode: "payment",
          allow_promotion_codes: true,
          )

        # Optionally, you could reserve the stock here
        # variant.update!(stock: variant.stock - 1)

        render json: { checkout_session_url: session.url }
      rescue Stripe::StripeError => e
        render json: { error: e.message }, status: :unprocessable_entity
      end
    end
  rescue ActiveRecord::StaleObjectError
    render json: { error: "concurrent update detected" }, status: :conflict
  end
end
