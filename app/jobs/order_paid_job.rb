class OrderPaidJob < ApplicationJob
  queue_as :default

  def perform(stripe_payment_intent_id)
    order = Order.find_by(stripe_payment_intent_id: stripe_payment_intent_id)

    unless order
      Rails.logger.error("Order not found for PaymentIntent: #{stripe_payment_intent_id}")
      return
    end

    begin
      pi = Stripe::PaymentIntent.retrieve(stripe_payment_intent_id)

      if pi.status == "succeeded"
        ActiveRecord::Base.transaction do
          order.update!(
            status: "paid",
            paid_at: Time.current
          )

          order.order_items.includes(:product_variant).each do |item|
            variant = item.product_variant
            variant.lock!
            variant.update!(stock: variant.stock - item.quantity)
          end
        end

        OrderMailer.order_created(order.id).deliver_later
      end
    rescue Stripe::StripeError => e
      Rails.logger.error("Failed to retrieve PaymentIntent: #{e.message}")
    end
  end
end
