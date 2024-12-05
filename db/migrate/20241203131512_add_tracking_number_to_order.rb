class AddTrackingNumberToOrder < ActiveRecord::Migration[8.0]
  def change
    add_column :orders, :carrier_name, :string
    add_column :orders, :carrier_tracking_link, :string
    add_column :orders, :carrier_tracking_number, :string
  end
end
