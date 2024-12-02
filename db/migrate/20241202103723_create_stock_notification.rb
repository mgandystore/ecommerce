class CreateStockNotification < ActiveRecord::Migration[8.0]
  def change
    create_table :stock_notifications, id: false do |t|
      t.string :id, primary_key: true
      t.string :email
      t.references :product_variant, type: :string, null: false,
                   foreign_key: { to_table: :product_variants, on_delete: :cascade, on_update: :cascade }
      t.timestamps
    end
  end
end
