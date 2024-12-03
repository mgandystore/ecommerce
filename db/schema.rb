# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2024_12_03_131512) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "action_text_rich_texts", force: :cascade do |t|
    t.string "name", null: false
    t.text "body"
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["record_type", "record_id", "name"], name: "index_action_text_rich_texts_uniqueness", unique: true
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.string "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "addresses", id: :string, force: :cascade do |t|
    t.string "address_line1"
    t.string "address_line2"
    t.string "city"
    t.string "postal_code"
    t.string "country"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "customers", id: :string, force: :cascade do |t|
    t.string "stripe_customer_id"
    t.string "email"
    t.string "full_name"
    t.string "phone"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_customers_on_email"
    t.index ["stripe_customer_id"], name: "index_customers_on_stripe_customer_id"
  end

  create_table "order_items", id: :string, force: :cascade do |t|
    t.string "order_id", null: false
    t.string "product_id", null: false
    t.string "product_variant_id", null: false
    t.string "stripe_product_price_id"
    t.integer "quantity", default: 1, null: false
    t.integer "total_amount", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["order_id"], name: "index_order_items_on_order_id"
    t.index ["product_id"], name: "index_order_items_on_product_id"
    t.index ["product_variant_id"], name: "index_order_items_on_product_variant_id"
    t.index ["stripe_product_price_id"], name: "index_order_items_on_stripe_product_price_id"
  end

  create_table "order_notes", id: :string, force: :cascade do |t|
    t.string "content"
    t.string "order_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["order_id"], name: "index_order_notes_on_order_id"
  end

  create_table "orders", id: :string, force: :cascade do |t|
    t.string "stripe_payment_id"
    t.string "stripe_session_id"
    t.string "status"
    t.datetime "paid_at", precision: nil
    t.datetime "shipped_at", precision: nil
    t.datetime "refunded_at", precision: nil
    t.string "shipping_address_id"
    t.string "customer_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "carrier_name"
    t.string "carrier_tracking_link"
    t.string "carrier_tracking_number"
    t.index ["customer_id"], name: "index_orders_on_customer_id"
    t.index ["shipping_address_id"], name: "index_orders_on_shipping_address_id"
    t.index ["status"], name: "index_orders_on_status"
    t.index ["stripe_payment_id"], name: "index_orders_on_stripe_payment_id"
    t.index ["stripe_session_id"], name: "index_orders_on_stripe_session_id"
  end

  create_table "product_variants", id: :string, force: :cascade do |t|
    t.string "product_id", null: false
    t.jsonb "variants", default: {}, null: false
    t.string "stripe_product_price_id"
    t.string "variants_slug", null: false
    t.integer "stock", default: 0
    t.integer "additional_price", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "stripe_product_id"
    t.index ["product_id"], name: "index_product_variants_on_product_id"
    t.index ["stripe_product_price_id"], name: "index_product_variants_on_stripe_product_price_id"
    t.index ["variants_slug"], name: "index_product_variants_on_variants_slug"
  end

  create_table "products", id: :string, force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.jsonb "specifications", default: {}
    t.jsonb "faq", default: {}
    t.integer "base_price", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "stock_notifications", id: :string, force: :cascade do |t|
    t.string "email"
    t.string "product_variant_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["product_variant_id"], name: "index_stock_notifications_on_product_variant_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "order_items", "orders", on_update: :cascade, on_delete: :cascade
  add_foreign_key "order_items", "product_variants", on_update: :cascade, on_delete: :restrict
  add_foreign_key "order_items", "products", on_update: :cascade, on_delete: :restrict
  add_foreign_key "order_notes", "orders"
  add_foreign_key "orders", "addresses", column: "shipping_address_id"
  add_foreign_key "orders", "customers"
  add_foreign_key "product_variants", "products", on_update: :cascade, on_delete: :cascade
  add_foreign_key "stock_notifications", "product_variants", on_update: :cascade, on_delete: :cascade
end
