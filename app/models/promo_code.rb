class PromoCode < ApplicationRecord
  # Relations
  has_many :promo_code_usages, dependent: :restrict_with_error
  has_many :orders, through: :promo_code_usages

  # Validations
  validates :code, presence: true, uniqueness: { case_sensitive: false }
  validates :discount_type, presence: true, inclusion: { in: %w[percentage fixed_amount] }
  validates :discount_value, presence: true, numericality: { greater_than: 0 }
  validates :minimum_order_amount, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :usage_limit, numericality: { greater_than: 0 }, allow_nil: true

  # Custom validations
  validate :validate_discount_value
  validate :validate_dates

  # Callbacks
  before_save :upcase_code
  before_create :set_defaults

  # Scopes
  scope :active, -> { where(active: true) }
  scope :available, -> {
    active
      .where("starts_at IS NULL OR starts_at <= ?", Time.current)
      .where("expires_at IS NULL OR expires_at > ?", Time.current)
      .where("usage_limit IS NULL OR usage_count < usage_limit")
  }

  enum :discount_type, { percentage: "percentage", fixed_amount: "fixed_amount" }

  # Methods
  def is_available?
    active? &&
      (starts_at.nil? || starts_at <= Time.current) &&
      (expires_at.nil? || expires_at > Time.current) &&
      (usage_limit.nil? || usage_count < usage_limit)
  end

  def discount_for_amount(amount)
    return 0 unless is_available?
    return 0 if minimum_order_amount.present? && amount < minimum_order_amount

    if percentage? # percentage
      (amount * discount_value / 100.0).round
    else # fixed amount
      [discount_value, amount].min # Can't discount more than the amount
    end
  end

  def increment_usage!
    update_column(:usage_count, usage_count + 1)
  end

  def decrement_usage!
    update_column(:usage_count, usage_count - 1) if usage_count > 0
  end

  def formatted_discount
    if percentage?
      "#{discount_value}%"
    else
      number_to_currency(discount_value / 100.0, precision: 2, unit: '€')
    end
  end

  private

  def validate_discount_value
    if percentage? && discount_value != nil && discount_value > 100
      errors.add(:discount_value, "ne peut pas dépasser 100%")
    end
  end

  def validate_dates
    if starts_at.present? && expires_at.present? && starts_at >= expires_at
      errors.add(:expires_at, "doit être postérieure à la date de début")
    end
  end

  def upcase_code
    self.code = code.upcase if code.present?
  end

  def set_defaults
    self.usage_count ||= 0
  end
end
