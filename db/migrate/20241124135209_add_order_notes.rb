class AddOrderNotes < ActiveRecord::Migration[8.0]
  def change
    create_table :order_notes, id: false do |t|
      t.string :id, primary_key: true
      t.string :content
      t.references :order, type: :string, null: false, foreign_key: { to_table: :orders }

      t.timestamps
    end
  end
end
