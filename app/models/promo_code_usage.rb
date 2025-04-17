class PromoCodeUsage < ApplicationRecord
  # Relations
  belongs_to :promo_code
  belongs_to :order

  # Validations
  validates :promo_code_id, presence: true
  validates :order_id, presence: true
  validates :discount_amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :promo_code_id, uniqueness: { scope: :order_id, message: "a déjà été utilisé pour cette commande" }

  private

  def increment_promo_code_usage_count
    promo_code.increment_usage!
  end

end
