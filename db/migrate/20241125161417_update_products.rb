class UpdateProducts < ActiveRecord::Migration[8.0]
  def change
    remove_column :products, :stripe_product_id
    add_column :product_variants, :stripe_product_id, :string
  end
end
