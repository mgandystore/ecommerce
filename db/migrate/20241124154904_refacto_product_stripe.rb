class RefactoProductStripe < ActiveRecord::Migration[8.0]
  def change
    rename_column :product_variants, :stripe_product_price_id, :stripe_product_id
    rename_column :product_variants, :stripe_price_id, :stripe_product_price_id
    add_column :products, :stripe_product_id, :string
  end
end
