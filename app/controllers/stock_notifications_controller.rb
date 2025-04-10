class StockNotificationsController < ApplicationController
  skip_before_action :verify_authenticity_token
  def create
    @product_variant = ProductVariant.find(params[:product_variant_id])
    @email = params[:email]

    ActiveRecord::Base.transaction do
      StockNotification.create!(
        product_variant_id: @product_variant.id,
        email: @email
      )
    end

    render json: {}, status: :created
  end
end
