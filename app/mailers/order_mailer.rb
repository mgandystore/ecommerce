class OrderMailer < ApplicationMailer

  def order_created(order_id)
    order = Order.find(order_id)
    @client_name = order.customer.full_name
    @order_number = order.id
    @variant_human = order.order_items.first.product_variant.human_format
    @client_email = order.customer.email
    mail(to: order.customer.email,
         subject: "#{order.customer.full_name}, merci d'avoir commandé")
  end

  def order_shipped(order_id)
    order = Order.find(order_id)
    @client_name = order.customer.full_name
    @variant_human = order.order_items.first.product_variant.human_format
    @order_number = order.id
    @tracking_number = order.carrier_tracking_number
    @carrier_name = order.carrier_name
    @tracking_url = order.carrier_tracking_link.start_with?("http") ? order.carrier_tracking_link : "https://#{order.carrier_tracking_link}"
    @delivery_address = order.human_address
    @client_email = order.customer.email

    mail(to: order.customer.email, subject: "#{order.customer.full_name}, votre commande est en route")
  end

  def order_paid(order_id)
    order = Order.find(order_id)
    @order_number = order.id
    @client_name = order.customer.full_name
    @client_email = order.customer.email
    @client_phone = order.customer.phone
    @variant_human = order.order_items.first.product_variant.human_format
    @pricing = order.compute_pricing
    @shipping_address = order.shipping_address
    @stripe_payment_intent_id = order.stripe_payment_intent_id

    admin_email = ENV.fetch("MARTIN_ASSMAC_EMAIL", "martin@assmac.com")
    mail(to: admin_email, subject: "Nouvelle commande payée ##{order.id} - Prête à expédier")
  end
end
