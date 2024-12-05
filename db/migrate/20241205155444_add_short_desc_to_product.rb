class AddShortDescToProduct < ActiveRecord::Migration[8.0]
  def change
    add_column :products, :short_description, :string
  end
end
