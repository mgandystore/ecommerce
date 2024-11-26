class DeleteStripeProductIdOnProductVariants < ActiveRecord::Migration[8.0]
  def change
    remove_column :product_variants, :stripe_product_id
  end
end
