class UpdateOrderWithStripePaymentIntentSecret < ActiveRecord::Migration[8.0]
  def change
    add_column :orders, :stripe_payment_intent_client_secret, :string
  end
end
