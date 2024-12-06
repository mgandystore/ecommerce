class ApplicationMailer < ActionMailer::Base
  default from: "boutique@mail.assmac.com"

  @shop_name = "La Boutique du Assmac"
  @shop_address = "Lyon 69100"
  @shop_email = "contact@mail.assmac.com"

  layout "mailer"
end
