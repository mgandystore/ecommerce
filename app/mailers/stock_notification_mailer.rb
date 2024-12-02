class StockNotificationMailer < ApplicationMailer
  def self.send_stock_notifications(product_variant_id)
    @product_variant = ProductVariant.find(product_variant_id)
    emails = StockNotification.where(product_variant_id: product_variant_id).pluck(:email).uniq

    return if emails.empty?

    # Send individual emails asynchronously
    emails.each do |email|
      StockNotificationMailer.send_individual_notification(email, product_variant_id).deliver_later
    end

    # Clean up notifications after queuing all emails
    StockNotification.where(
      email: emails,
      product_variant_id: product_variant_id
    ).delete_all
  end

  def send_individual_notification(email, product_variant_id)
    @product_variant = ProductVariant.find(product_variant_id)
    @variant_name = @product_variant.human_format
    @product_url = Rails.application.routes.url_helpers.home_url + "?variant=couleur:#{@product_variant.variants["couleur"]}"
    @shop_name = "La Boutique"
    @shop_address = "Lyon 69100"
    @shop_email = "contact@assmac.com"
    @client_email = email

    mail(
      to: email,
      subject: "Le assmac #{@variant_name} est disponible !"
    )
  end
end