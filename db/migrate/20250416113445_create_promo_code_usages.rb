class CreatePromoCodeUsages < ActiveRecord::Migration[8.0]
  def change
    create_table :promo_code_usages, id: false do |t|
      t.string :id, primary_key: true
      t.string :promo_code_id
      t.string :order_id
      t.integer :discount_amount

      t.timestamps
    end
  end
end
