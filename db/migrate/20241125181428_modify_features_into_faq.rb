class ModifyFeaturesIntoFaq < ActiveRecord::Migration[8.0]
  def change
    rename_column :products, :features, :faq
  end
end
