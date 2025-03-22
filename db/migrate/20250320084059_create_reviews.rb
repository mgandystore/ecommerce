class CreateReviews < ActiveRecord::Migration[8.0]
  def change
    create_table :reviews, id: false do |t|
      t.string :id, primary_key: true
      t.string :name
      t.text :content
      t.decimal :stars

      t.timestamps
    end
  end
end
