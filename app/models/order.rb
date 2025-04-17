class Order < ApplicationRecord
  has_many :order_items
  has_many :order_notes
  has_many :promo_code_usages
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

  # Calculates pricing details for an order
  #
  # @param [Boolean, String] pickup_point Whether this is a pickup order
  # @param [Boolean] apply_promo_code Whether to apply promo code if available
  # @return [Hash] pricing information with keys:
  #   @option [Integer] :shipping The shipping cost
  #   @option [Integer] :items Total cost of all items
  #   @option [Integer] :total Final total after discounts
  #   @option [Integer] :discount (optional) Amount discounted if promo applied
  #   @option [Hash] :promo_code (optional) Applied promo details
  #     @option [String] :code The promo code
  #     @option [String] :description Promo description
  #     @option [String] :discount_type Type of discount (percentage/fixed)
  #     @option [Float] :discount_value Value of the discount
  def compute_pricing(pickup_point = self.shipping_address&.pickup_point? || false, apply_promo_code = true)
    order_items = self.order_items

    pickup_point = pickup_point.to_s.downcase == "true" if pickup_point.is_a?(String)

    shipping_cost = pickup_point ? 0 : 200

    # Calculate items cost
    items_cost = order_items.sum(&:total_amount)

    # Calculate discount if promo code is provided
    discount = 0
    applied_promo = nil

    # Check if there's an existing promo code usage for this order
    order_id = order_items.first&.order_id
    if order_id && apply_promo_code
      promo_usage = PromoCodeUsage.where(order_id: order_id).first
      if promo_usage
        discount = promo_usage.discount_amount
        applied_promo = promo_usage.promo_code
      end
    end

    total_with_shipping = items_cost + shipping_cost
    # Ensure discount doesn't exceed items cost
    discount = [discount, total_with_shipping].min

    # Calculate total with discount
    total = [total_with_shipping - discount, 0].max

    # Return pricing details
    result = {
      shipping: shipping_cost,
      items: items_cost,
      total: total
    }

    # Add promo code info if applicable
    if discount > 0
      result[:discount] = discount
      result[:promo_code] = {
        code: applied_promo&.code,
        description: applied_promo&.description,
        discount_type: applied_promo&.discount_type,
        discount_value: applied_promo&.discount_value
      }
    end

    result
  end
end
