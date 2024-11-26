class ProductVariant < ApplicationRecord
  has_many_attached :images
  belongs_to :product

  # human format is Key Value / Key Value
  # sorted by key to have the same order
  def human_format
    variants.sort_by { |k, _v| k }.map { |k, v| "#{k} #{v}" }.join(" / ")
  end
end
