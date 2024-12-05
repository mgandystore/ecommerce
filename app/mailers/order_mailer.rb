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
    @tracking_url = order.carrier_tracking_link
    @delivery_address = order.human_address
    @client_email = order.customer.email
    mail(to: order.customer.email, subject: "#{order.customer.full_name}, votre commande est en route")
  end
end