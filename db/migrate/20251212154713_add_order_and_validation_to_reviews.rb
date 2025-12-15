class AddOrderAndValidationToReviews < ActiveRecord::Migration[8.0]
  def change
    add_column :reviews, :order_id, :string
    add_column :reviews, :validated, :boolean, default: false, null: false
    add_column :reviews, :token, :string
    add_index :reviews, :token, unique: true
    add_index :reviews, :order_id
  end
end
