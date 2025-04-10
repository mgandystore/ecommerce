class UpdateCustomer < ActiveRecord::Migration[8.0]
  def change
    remove_column :customers, :stripe_customer_id, :string
  end
end
