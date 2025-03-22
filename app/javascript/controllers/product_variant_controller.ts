import { ActionEvent, Controller } from '@hotwired/stimulus'

export enum VariantType {
  Color = 'couleur',
  Size = 'size',
}

export type VariantSelectEvent = CustomEvent<{
  variant: string
  type: VariantType
}>;

export default class extends Controller {
  static targets = [ 'variant', 'variantname' ]
  static values = {
    variant: String,
    type: String,
    valueToClass: Object
  }

  declare variantValue: string
  declare typeValue: VariantType
  declare valueToClassValue: Record<string, string>

  declare readonly variantTargets: HTMLDivElement[]
  declare readonly variantnameTarget: HTMLDivElement
  declare hasVariantnameTarget: boolean

  connect() {
  }

  variantValueChanged() {
    this.dispatch('variant-selected', {
      detail: {
        variant: this.variantValue,
        type: this.typeValue,
      }
    })

    if (this.hasVariantnameTarget) {
      this.variantnameTarget.innerHTML = this.variantValue
    }

    this.variantTargets.forEach((el) => {
      const variant = el.dataset.productVariantVariantParam!
      if (variant !== this.variantValue) {
        this.unselectVariant(el, variant)
        return
      }
      this.selectVariant(el, variant)
    })
  }

  unselectVariant(el: HTMLDivElement, variant: string) {
    const hasImage = el.dataset.productVariantHasImageParam === 'true'

    switch (this.typeValue) {
      case VariantType.Color:
        el.innerHTML = ''
        if (hasImage) {
          el.className = `bg-cover bg-center color-variant-button`
        } else {
          const color = this.valueToClassValue[variant]
          el.className = `bg-${color}-300 hover:bg-${color}-500 focus:bg-${color}-500 color-variant-button`
        }
        break
    }
  }

  selectVariant(el: HTMLDivElement, variant: string) {
    const hasImage = el.dataset.productVariantHasImageParam === 'true'

    switch (this.typeValue) {
      case VariantType.Color:
        el.innerHTML = this.checkSvg()
        if (hasImage) {
          el.className = `bg-cover bg-center ring-2 ring-offset-1 color-variant-button-active`
        } else {
          const color = this.valueToClassValue[variant]
          el.className = `bg-${color}-500 ring-${color}-300 color-variant-button-active`
        }
        break
    }
  }

  checkSvg() {
    const size = '18'
    return `
      <svg class="transition duration-300 ease-in-out" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="ri:check-fill">
        <path id="Vector" d="M7.5 11.3775L14.394 4.48425L15.4545 5.54475L7.5 13.4993L2.727 8.72625L3.7875 7.66575L7.5 11.3775Z" fill="white"/>
        </g>
      </svg>
    `
  }

  handleVariantValueChanged(event: ActionEvent) {
    this.variantValue = event.params.variant
  }
}
