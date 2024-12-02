class OrderMailer < ApplicationMailer

  def order_created(order_id)
    order = Order.find(order_id)
    @client_name = order.customer.full_name
    @order_number = order.id
    @shop_name = "La Boutique du Assmac"
    @shop_address = "Lyon 69100"
    @shop_email = "contact@assmac.com"
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
    @tracking_number = "123456789"
    @carrier_name = "Colissimo"
    @tracking_url = "https://www.colissimo.fr/123456789"
    @delivery_address = order.shipping_address.address_line1 + ", " + order.shipping_address.city + ", " + order.shipping_address.postal_code
    @shop_name = "La Boutique du Assmac"
    @shop_address = "Lyon 69100"
    @shop_email = "contact@assmac.com"
    mail(to: order.customer.email,
         subject: "#{order.customer.full_name}, votre commande est en route")
  end
end
