class StockNotification < ApplicationRecord
  belongs_to :product_variant
  validates :email, presence: true
end
