class UpdateOrder < ActiveRecord::Migration[8.0]
  def change
    remove_column :orders, :stripe_payment_id, :string
    remove_column :orders, :stripe_payment_method_id, :string
  end
end
