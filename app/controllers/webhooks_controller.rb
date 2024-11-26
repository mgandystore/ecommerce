class WebhooksController < ApplicationController
  skip_before_action :verify_authenticity_token


  def stripe
    payload = request.body.read
    event = nil

    begin
      event = Stripe::Webhook.construct_event(
        payload,
        request.headers['Stripe-Signature'],
        stripe_webhook_signing_secret
      )
    rescue JSON::ParserError => e
      # Invalid payload
      render json: { error: { message: e.message } }, status: :bad_request
      return
    rescue Stripe::SignatureVerificationError => e
      # Invalid signature
      render json: { error: { message: e.message, extra: "Sig verification failed" } }, status: :bad_request
      return
    end

    puts "Event type: #{event.type}, #{event.id}"
    # Handle the event
    case event.type
    when "checkout.session.completed"
      Order::CreateOrderFromStripeCheckoutSessionCompleted.perform_later(event.data.object.id)
    else
      # other
    end

    render json: { message: :success }
  end

  def stripe_webhook_signing_secret
    Rails.configuration.stripe["webhook_signing"]
  end
end
