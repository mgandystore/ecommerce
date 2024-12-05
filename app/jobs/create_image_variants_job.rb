class CreateImageVariantsJob < ApplicationJob
  queue_as :default

  def perform(criteria)
    case criteria[:record_type]
    when Product.class
      product = Product.find(criteria[:record_id])
      return unless product.images.attached?

      product.images.each do |image|
        image.variant(:thumbnail).processed
        image.variant(:medium).processed
        image.variant(:large).processed
        image.variant(:blur).processed
      end
    when ProductVariant.class
      product_variant = ProductVariant.find(criteria[:record_id])
      return unless product_variant.images.attached?

      product_variant.images.each do |image|
        image.variant(:thumbnail).processed
        image.variant(:medium).processed
        image.variant(:large).processed
        image.variant(:blur).processed
      end
    else
      Rails.logger.error "Unknown record type: #{criteria[:record_type]}"
    end
  end
end
