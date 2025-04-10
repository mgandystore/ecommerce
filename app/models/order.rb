class Order < ApplicationRecord
  has_many :order_items
  has_many :order_notes
  belongs_to :customer, optional: true
  belongs_to :shipping_address, class_name: "Address", optional: true
  before_save :update_status_timestamp, if: :status_changed?
  enum :status, {
    paid: "paid",
    shipped: "shipped",
    refunded: "refunded",
    pending: "pending"
  }

  def update_status_timestamp
    self[:"#{status}_at"] = Time.current if self.respond_to?(:"#{status}_at")
  end

  def human_address
    [
      shipping_address.address_line1,
      shipping_address.address_line2,
      shipping_address.city,
      shipping_address.postal_code,
      shipping_address.country,
    ].compact.join(", ")

  end

  def shipped?
    shipped_at != nil
  end

  def self.count_paid
    where(status: :paid).count
  end

  def as_json(options = nil)
    {
      id: self.id,
      total_amount: self.order_items.sum(:total_amount),
      stripe_payment_intent_id: self.stripe_payment_intent_id,
      stripe_payment_intent_client_secret: self.stripe_payment_intent_client_secret,
      items: self.order_items.map do |item|
        {
          product_variant_id: item.product_variant_id,
          product_id: item.product_id,
          quantity: item.quantity,
          product_name: item.product.name,
          variant_human_format: item.product_variant.human_format,
          short_description: item.product.short_description,
          total_amount: item.total_amount,
          images: item.product_variant.image_urls([ :thumbnail, :blur ])
        }
      end
    }
  end
end
