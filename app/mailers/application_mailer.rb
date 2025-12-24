class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("SMTP_FROM_EMAIL", "martin@assmac.com")
  layout "mailer"

  before_action :set_common_variables

  private

  def set_common_variables
    @settings = Setting.first
    @shop_name = "La Boutique du Assmac"
    @shop_address = @settings.address
    @shop_email = @settings.contact_mail
  end
end
