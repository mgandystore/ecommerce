class CheckoutController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    variant = ProductVariant.includes(:product).find_by(id: params[:product_variant_id])
    if variant == nil
      return render json: { error: "product variant not found" }, status: :not_found
    end

    puts variant.variants["color"]
    session = Stripe::Checkout::Session.create(
      success_url: "http://localhost:3000",
      cancel_url: "http://localhost:3000",
      payment_method_types: ["card"],
      shipping_address_collection: {
        allowed_countries: %w[FR BE]
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
    )

    render json: { checkout_session_url: session.url }
  end
end
