class Order
  class CreateOrderFromStripeCheckoutSessionCompleted < ApplicationJob
    queue_as :default

    def perform(checkout_session_id)
      session = Stripe::Checkout::Session.retrieve(checkout_session_id)

      ActiveRecord::Base.transaction do
        address = Address.create!(
          address_line1: session.shipping_details.address.line1,
          address_line2: session.shipping_details.address.line2,
          city: session.shipping_details.address.city,
          postal_code: session.shipping_details.address.postal_code,
          country: session.shipping_details.address.country,
        )

        customer = Customer.create!(
          stripe_customer_id: session.customer,
          email: session.customer_details.email,
          full_name: session.customer_details.name,
          phone: session.customer_details.phone,
        )

        order = Order.create!(
          stripe_payment_id: session.payment_intent,
          stripe_session_id: session.id,
          status: :paid,
          shipping_address_id: address.id,
          customer_id: customer.id,
        )

        line_items = Stripe::Checkout::Session.list_line_items(session.id)
        stripe_product = Stripe::Product.retrieve(line_items.data.first.price.product)

        line_items.data.each do |line_item|
          order_item = OrderItem.create!(
            order: order,
            stripe_product_price_id: line_item.price.id,
            product_id: stripe_product.metadata.product_id,
            product_variant_id: stripe_product.metadata.variant_id,
            quantity: line_item.quantity,
            total_amount: line_item.amount_total,
          )

          ProductVariant
            .where(id: stripe_product.metadata.variant_id)
            .update_all("stock = stock - 1")
        end
      end
    end
  end
end