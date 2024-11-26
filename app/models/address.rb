class Address < ApplicationRecord
  has_many :order_items
end
