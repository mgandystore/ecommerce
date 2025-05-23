// product_gallery_controller.ts
import { Controller } from '@hotwired/stimulus'
import { VariantSelectEvent } from './product_variant_controller'
import { VariantSlugSelectedEvent } from './product_controller'

type Image = {
  url: string
  url_thumbnail: string
  url_medium: string
  url_large: string
  url_blur: string
  alt: string
}

type Images = Record<string, Image[]>

export default class extends Controller {
  static targets = [ 'mainImage', 'counter', 'thumbnail', 'modal', 'modalImage', 'thumbnailsContainer', 'thumbnailsTemplate' ]
  static values = {
    images: Object,
    imageUsed: Array,
    currentIndex: Number,
    isZoomed: Boolean,
    variantSelected: String
  }

  declare mainImageTarget: HTMLImageElement
  declare counterTarget: HTMLSpanElement
  declare thumbnailTargets: HTMLButtonElement[]
  declare modalTarget: HTMLDivElement
  declare modalImageTarget: HTMLImageElement
  declare thumbnailsContainerTarget: HTMLDivElement
  declare thumbnailsTemplateTarget: HTMLTemplateElement
  declare fullImage: HTMLImageElement | null

  declare readonly imagesValue: Images
  declare imageUsedValue: Image[]
  declare currentIndexValue: number
  declare isZoomedValue: boolean
  declare variantSelectedValue: string

  private largeImagesLoaded = new Set<string>()

  connect() {
    this.updateThumbnailStates()
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    this.updateMainImage()
  }

  disconnect() {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this))
  }

  getImage() {
    if (this.imageUsedValue && this.imageUsedValue[this.currentIndexValue]) {
      return this.imageUsedValue[this.currentIndexValue]
    }
  }

  updateMainImage() {
    const currentImage = this.getImage()
    if (!currentImage) {
      return
    }

    const toggleAnimation = (appear: boolean) => {
      if (appear) {
        this.mainImageTarget.classList.remove('opacity-0')
        this.mainImageTarget.classList.add('opacity-100')
      } else {
        this.mainImageTarget.classList.remove('opacity-100')
        this.mainImageTarget.classList.add('opacity-0')
      }
    }

    // check if the current image is already the same we do nothing
    if (this.mainImageTarget.src === currentImage.url_large) {
      return
    }

    // check if the image is already loaded, if so we just update the src
    if (this.largeImagesLoaded.has(currentImage.url_large)) {
      this.mainImageTarget.src = currentImage.url_large
      return
    }

    toggleAnimation(false)
    this.mainImageTarget.src = currentImage.url_blur
    toggleAnimation(true)

    this.fullImage = new Image()
    this.fullImage.src = currentImage.url_large
    this.fullImage.onload = () => {
      const mayNewCurrentImage = this.getImage()

      // Between the time we started loading the image and the time it was loaded, the user may have changed the image
      // If so, we don't update the image
      if (mayNewCurrentImage && mayNewCurrentImage.url !== currentImage.url) {
        return
      }

      // Once loaded, update the main image source
      this.mainImageTarget.src = this.fullImage!.src

      toggleAnimation(false)
      this.largeImagesLoaded.add(currentImage.url_large)
      toggleAnimation(true)
    }
  }

  // variantSlugSelectedEvent is dispatched by the Product controller
  variantSlugSelectedEvent(evt: VariantSlugSelectedEvent) {
    this.variantSelectedValue = evt.detail.variant_slug
  }

  updateGalleryOnVariantChange(
    imagesValue: Images,
    currentVariant: string,
    currentIndex: number,
  ): { newImageUsed: Image[]; newIndex: number } {
    // Build new imageUsed array starting with product images
    let newImageUsed: Image[] = [ ...imagesValue.product_images ]

    // Count of base product images
    const productImagesCount = imagesValue.product_images.length

    // Add current variant images if they exist
    const currentVariantImages = imagesValue[currentVariant] || []
    newImageUsed.push(...currentVariantImages)

    // Ensure the index doesn't exceed the new array length
    let newIndex = Math.min(currentIndex, newImageUsed.length - 1)

    // If we were viewing a variant image (index >= productImagesCount)
    if (currentIndex >= productImagesCount) {
      // If new variant has images, try to maintain relative position
      if (currentVariantImages.length > 0) {
        const previousVariantIndex = currentIndex - productImagesCount
        if (previousVariantIndex < currentVariantImages.length) {
          newIndex = productImagesCount + previousVariantIndex
        } else {
          // If relative position is too high, show last image of new variant
          newIndex = productImagesCount + currentVariantImages.length - 1
        }
      } else {
        // If new variant has no images, fall back to last product image
        newIndex = productImagesCount - 1
      }
    }

    return {
      newImageUsed,
      newIndex
    }
  }

  variantSelectedValueChanged() {
    let { newImageUsed, newIndex } = this.updateGalleryOnVariantChange(
      this.imagesValue,
      this.variantSelectedValue,
      this.currentIndexValue,
    )

    this.imageUsedValue = newImageUsed
    this.currentIndexValue = newIndex

    // Clear existing thumbnails
    this.thumbnailsContainerTarget.innerHTML = ''

    // Create new thumbnails using the template
    this.imageUsedValue.forEach((image, index) => {
      const clone = this.thumbnailsTemplateTarget.content.cloneNode(true) as DocumentFragment
      const button = clone.querySelector('button')
      const img = clone.querySelector('img')

      if (button && img) {
        button.dataset.productGalleryIndexParam = index.toString()
        img.src = image.url_thumbnail
        img.alt = image.alt
        this.thumbnailsContainerTarget.appendChild(clone)
      }
    })

    this.currentIndexValueChanged()
  }

  currentIndexValueChanged() {
    if (this.imageUsedValue) {
      const currentImage = this.imageUsedValue[this.currentIndexValue]
      if (currentImage) {
        // First set the blur image
        this.updateMainImage()

        // Update modal image
        this.modalImageTarget.src = currentImage.url
        this.modalImageTarget.alt = currentImage.alt

        // Update counter
        this.counterTarget.textContent = `${this.currentIndexValue + 1} / ${this.imageUsedValue.length}`

        // Update thumbnails
        this.updateThumbnailStates()
      }
    }
  }

  nextImage() {
    this.currentIndexValue = (this.currentIndexValue + 1) % this.imageUsedValue.length
  }

  previousImage() {
    this.currentIndexValue = (this.currentIndexValue - 1 + this.imageUsedValue.length) % this.imageUsedValue.length
  }

  //@ts-ignore
  selectImage({ params: { index } }) {
    this.currentIndexValue = parseInt(index)
  }

  updateThumbnailStates() {
    this.thumbnailTargets.forEach((thumbnail, index) => {
      if (index === this.currentIndexValue) {
        thumbnail.classList.add('border-black')
        thumbnail.classList.remove('border-transparent', 'hover:border-gray-300')
      } else {
        thumbnail.classList.remove('border-black')
        thumbnail.classList.add('border-transparent', 'hover:border-gray-300')
      }
    })
  }

  zoomIn() {
    this.modalTarget.classList.remove('hidden')
    document.body.classList.add('overflow-hidden')
    this.isZoomedValue = true
  }

  zoomOut() {
    this.modalTarget.classList.add('hidden')
    document.body.classList.remove('overflow-hidden')
    this.isZoomedValue = false
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isZoomedValue) {
      this.zoomOut()
    }
  }

  closeModalFromBackground(event: Event) {
    if (event.target === this.modalTarget) {
      this.zoomOut()
    }
  }
}
