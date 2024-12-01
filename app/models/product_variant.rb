class ProductVariant < ApplicationRecord
  has_many_attached :images do |attachment|
    attachment.variant :thumbnail, resize_to_limit: [200, nil]
    attachment.variant :medium, resize_to_limit: [500, nil]
    attachment.variant :large, resize_to_limit: [1000, nil]
  end

  belongs_to :product

  # human format is Key Value / Key Value
  # sorted by key to have the same order
  def human_format
    variants.sort_by { |k, _v| k }.map { |k, v| "#{k} #{v}" }.join(" / ")
  end
end
