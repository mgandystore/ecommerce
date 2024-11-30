# frozen_string_literal: true

class ProductGalleryComponent < ViewComponent::Base
  # @param images [Hash] A hash of images, where the key is the variant slug and the value is an array of image objects
  #   Each image object has a `url` and `alt` property.
  # @example
  #   Example:
  #   {
  #     "product_images": [
  #       { url: "https://example.com/image1.jpg", alt: "Image 1" },
  #       { url: "https://example.com/image2.jpg", alt: "Image 2" },
  #     ],
  #     "couleur_rouge": [
  #       { url: "https://example.com/image1.jpg", alt: "Image 1" },
  #       { url: "https://example.com/image2.jpg", alt: "Image 2" },
  #     ],
  #     "couleur_bleu": [
  #       { url: "https://example.com/image3.jpg", alt: "Image 3" },
  #       { url: "https://example.com/image4.jpg", alt: "Image 4" },
  #     ],
  #   }
  def initialize(images:)
    @images = images
  end

  private

  attr_reader :images
end