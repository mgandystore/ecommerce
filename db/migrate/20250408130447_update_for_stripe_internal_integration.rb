class UpdateForStripeInternalIntegration < ActiveRecord::Migration[8.0]
  def change
    remove_column :orders, :stripe_session_id
    remove_column :order_items, :stripe_product_price_id
    remove_column :product_variants, :stripe_product_id
    remove_column :product_variants, :stripe_product_price_id

    add_column :addresses, :pickup_point, :boolean, default: false
    add_column :addresses, :pickup_point_shop_name, :string
    add_column :addresses, :pickup_point_id, :string
    add_column :addresses, :pickup_point_name, :string
  end
end
