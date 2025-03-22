class CreateSettings < ActiveRecord::Migration[8.0]
  def change
    create_table :settings, id: false do |t|
      t.string :id, primary_key: true
      t.string :cgv
      t.string :instagram
      t.timestamps
    end
  end
end
