class ApplicationMailer < ActionMailer::Base
  default from: "boutique@mail.assmac.com"

  @shop_name = "La Boutique du Assmac"
  @shop_address = "Lyon 69100"
  @shop_email = "contact@mail.assmac.com"

  layout "mailer"

  ActionMailer::MailDeliveryJob.rescue_from(Exception) do |exception|
    puts "Exception in ActionMailer::MailDeliveryJob: #{exception.message}"
    puts exception.backtrace

    Rails.error.report(exception)
    raise exception
  end
end
