class CreateInitialSchema < ActiveRecord::Migration[8.0]
  def change
    create_table :products, id: false do |t|
      t.string :id, primary_key: true
      t.string :name, null: false
      t.text :description
      t.jsonb :specifications, default: {}
      t.jsonb :features, default: {}
      t.integer :base_price, null: false, default: 0

      t.timestamps
    end

    create_table :product_variants, id: false do |t|
      t.string :id, primary_key: true
      t.references :product, type: :string, null: false,
                   foreign_key: { to_table: :products, on_delete: :cascade, on_update: :cascade }
      t.jsonb :variants, null: false, default: {}
      t.string :stripe_product_price_id
      t.string :stripe_price_id
      t.string :variants_slug, null: false
      t.integer :stock, default: 0
      t.integer :additional_price, default: 0

      t.timestamps

      t.index :variants_slug
      t.index :stripe_product_price_id
      t.index :stripe_price_id
    end


    create_table :customers, id: false do |t|
      t.string :id, primary_key: true
      t.string :stripe_customer_id
      t.string :email
      t.string :full_name
      t.string :phone

      t.timestamps

      t.index :stripe_customer_id
      t.index :email
    end

    create_table :addresses, id: false do |t|
      t.string :id, primary_key: true

      t.string :address_line1
      t.string :address_line2
      t.string :city
      t.string :postal_code
      t.string :country

      t.timestamps
    end

    create_table :orders, id: false do |t|
      t.string :id, primary_key: true
      t.string :stripe_payment_id
      t.string :stripe_session_id
      t.string :status
      t.timestamp :paid_at
      t.timestamp :shipped_at
      t.timestamp :refunded_at
      t.references :shipping_address, type: :string, foreign_key: { to_table: :addresses }
      t.references :customer, type: :string, foreign_key: { to_table: :customers }

      t.timestamps

      t.index :stripe_payment_id
      t.index :stripe_session_id
      t.index :status
    end


    create_table :order_items, id: false do |t|
      t.string :id, primary_key: true
      t.references :order, type: :string, null: false,
                   foreign_key: { to_table: :orders, on_delete: :cascade, on_update: :cascade }
      t.references :product, type: :string, null: false,
                   foreign_key: { to_table: :products, on_delete: :restrict, on_update: :cascade }
      t.references :product_variant, type: :string, null: false,
                   foreign_key: { to_table: :product_variants, on_delete: :restrict, on_update: :cascade }
      t.string :stripe_product_price_id
      t.integer :quantity, null: false, default: 1
      t.integer :total_amount, null: false

      t.timestamps

      t.index :stripe_product_price_id
    end
  end
end