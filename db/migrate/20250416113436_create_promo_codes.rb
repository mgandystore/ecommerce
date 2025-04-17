class CreatePromoCodes < ActiveRecord::Migration[8.0]
  def change
    create_table :promo_codes, id: false do |t|
      t.string :id, primary_key: true
      t.string :code
      t.string :description
      t.string :discount_type
      t.integer :discount_value
      t.integer :minimum_order_amount
      t.integer :usage_limit
      t.integer :usage_count
      t.datetime :starts_at
      t.datetime :expires_at
      t.boolean :active

      t.timestamps
    end
    add_index :promo_codes, :code, unique: true
  end
end
