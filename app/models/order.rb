class Order < ApplicationRecord
  has_many :order_items
  has_many :order_notes
  belongs_to :customer
  belongs_to :shipping_address, class_name: "Address"
  before_save :update_status_timestamp, if: :status_changed?
  enum :status, {
    paid: "paid",
    shipped: "shipped",
    refunded: "refunded",
  }

  def update_status_timestamp
    self[:"#{status}_at"] = Time.current if self.respond_to?(:"#{status}_at")
  end

  def shipped?
    shipped_at != nil
  end

  def self.count_paid
    where(status: :paid).count
  end
end
