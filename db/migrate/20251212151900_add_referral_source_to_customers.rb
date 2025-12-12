class AddReferralSourceToCustomers < ActiveRecord::Migration[8.0]
  def change
    add_column :customers, :referral_source, :string
  end
end
