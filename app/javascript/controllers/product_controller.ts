import { ActionEvent, Controller } from '@hotwired/stimulus'
import { Product, ProductVariant } from '../types'
import { VariantSelectEvent, VariantType } from './product_variant_controller'


export type VariantSlugSelectedEvent = CustomEvent<{
  variant_slug: string
}>;

const animatedSpinner = `
<svg aria-hidden="true" role="status" class="inline mr-2 w-4 h-4 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"></path>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1f2937"></path>
        </svg>
        `

export default class extends Controller {
  static targets = [
    'price',
    'fixedBuyBtnContainer',
    'buyButtons',
    'outOfStock',
    'notifyForm',
    'notifyFormTemplate',
    'notifyEmail',
    'notifyButton',
    'mainBuyButtonContainer',
  ]
  static values = {
    product: Object,
    price: Number,
    variantsSelected: { type: Object, default: {} },
    currentProductVariant: { type: Object, default: undefined },
  }


  declare productValue: Product
  declare variantsSelectedValue: Record<string, string>
  declare currentProductVariantValue: ProductVariant | undefined

  declare readonly priceTarget: HTMLElement
  declare readonly fixedBuyBtnContainerTarget: HTMLButtonElement
  declare readonly buyButtonsTargets: HTMLButtonElement[]
  declare readonly notifyFormTemplateTarget: HTMLTemplateElement
  declare readonly notifyEmailTarget: HTMLInputElement
  declare readonly notifyButtonTarget: HTMLButtonElement
  declare readonly mainBuyButtonContainerTarget: HTMLElement
  declare readonly notifyFormTarget: HTMLElement

  declare readonly hasNotifyFormTarget: boolean

  private mainBuyButtonContainer: Node | undefined

  connect() {
  }

  // variantSelected is dispatched by the ProductVariant controller
  variantSelectedEvent(evt: VariantSelectEvent) {
    this.variantsSelectedValue = { ...this.variantsSelectedValue, [evt.detail.type]: evt.detail.variant }
  }

  buyBtnVisibilityEvent(evt: CustomEvent<{ visible: boolean }>) {
    this.setVisibilityFixedBuyBtnContainer(!evt.detail.visible)
  }

  footerVisibilityEvent(evt: CustomEvent<{ visible: boolean }>) {
    this.setFixedBuyBtnContainerAboveFooter(evt.detail.visible)
  }

  setVisibilityFixedBuyBtnContainer(visible: boolean) {
    if (visible) {
      this.fixedBuyBtnContainerTarget.classList.remove('max-sm:hidden')
    } else {
      this.fixedBuyBtnContainerTarget.classList.add('max-sm:hidden')
    }
  }

  setFixedBuyBtnContainerAboveFooter(footerVisible: boolean) {
    if (footerVisible) {
      this.fixedBuyBtnContainerTarget.classList.remove('fixed')
      this.fixedBuyBtnContainerTarget.classList.remove('bottom-0')
    } else {
      this.fixedBuyBtnContainerTarget.classList.add('fixed')
      this.fixedBuyBtnContainerTarget.classList.add('bottom-0')
    }
  }

  variantsSelectedValueChanged() {
    if (Object.keys(this.variantsSelectedValue).length < this.minVariants()) {
      console.warn('not enough variants selected')
      return
    }

    // find a product variant that matches the selected variants
    let someProductVariant = this.productValue.product_variants.find((pv) => {
      for (const [ type, variant ] of Object.entries(this.variantsSelectedValue)) {
        const variants = pv?.variants as Record<string, string>
        if (variants[type] !== variant) {
          return false
        }
      }
      return true
    })

    if (someProductVariant) {
      this.currentProductVariantValue = someProductVariant
      const price = this.productValue.base_price + (someProductVariant.additional_price ?? 0)

      // Update price of the fixed button to Do something like "Acheter - {PRICE} €"
      this.fixedBuyBtnContainerTarget.querySelector('button')!.innerText = `Acheter — ${+price / 100} €`

      this.dispatch('variant-slug-selected', {
        detail: {
          variant_slug: this.currentProductVariantValue.variants_slug
        },
        bubbles: true,
      })
    }
  }

  currentProductVariantValueChanged() {
    if (!this.currentProductVariantValue) {
      this.priceTarget.innerText = '— €'
      return
    }

    const priceAmount = this.productValue.base_price + (this.currentProductVariantValue.additional_price ?? 0)
    const price = priceAmount.toString() ?? '?'
    this.priceTarget.innerText = `${+price / 100} €`

    this.updateStockStatus()
  }

  private updateStockStatus() {
    const isOutOfStock = this.currentProductVariantValue?.stock === 0

    if (this.hasNotifyFormTarget) {
      this.notifyFormTarget.remove()
    }

    if (isOutOfStock) {
      // Remove the fixed buy button container (in mobile)
      this.fixedBuyBtnContainerTarget.classList.add('opacity-0')

      // Remove from the dom the main buy button container
      // before removing it, we need to get the html and set it in the this.mainBuyButtonContainer
      if (!this.mainBuyButtonContainer) {
        this.mainBuyButtonContainer = this.mainBuyButtonContainerTarget.cloneNode(true)
        this.mainBuyButtonContainerTarget.remove()
      }


      // Clone the template content and insert it before the template
      const template = this.notifyFormTemplateTarget
      const formContainer = textToNode(template.innerHTML)

      formContainer.setAttribute('data-product-target', 'notifyForm')
      formContainer.querySelector('input')?.setAttribute('data-product-target', 'notifyEmail')
      formContainer.querySelector('button')?.setAttribute('data-action', 'click->product#submitStockNotification')
      formContainer.querySelector('button')?.setAttribute('data-product-target', 'notifyButton')
      template.parentElement?.insertBefore(formContainer, template)

      // Force a reflow to ensure the initial state is rendered
      formContainer.offsetHeight

      // Then remove opacity-0 in the next frame
      requestAnimationFrame(() => {
        formContainer.classList.remove('opacity-0')
      })
    } else {
      this.fixedBuyBtnContainerTarget.classList.remove('opacity-0')

      // insert before the template form the mainButtonContainer
      if (this.mainBuyButtonContainer) {
        this.notifyFormTemplateTarget.parentElement?.insertBefore(this.mainBuyButtonContainer, this.notifyFormTemplateTarget)
        this.mainBuyButtonContainer = undefined
      }

      // Remove out of stock form if exists
      const outOfStockForm = document.getElementById('out_of_stock_form')
      if (outOfStockForm) {
        outOfStockForm.remove()
      }
    }
  }

  submitStockNotification() {
    const email = this.notifyEmailTarget.value
    if (!email || !this.currentProductVariantValue) {
      return
    }

    this.notifyButtonTarget.innerHTML = `
      ${animatedSpinner}
      Envoi en cours...
    `

    fetch('/stock_notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        product_variant_id: this.currentProductVariantValue.id,
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to submit notification')
        }

        setTimeout(() => {
          const successChildNode = `
          <span class="text-xs text-emerald-500 mt-2">
            Nous vous préviendrons dès que ce produit sera de nouveau disponible
          </span>`

          this.notifyFormTarget.appendChild(textToNode(successChildNode))
          this.notifyEmailTarget.disabled = true
          this.notifyEmailTarget.classList.add('opacity-50', 'pointer-events-none')
          this.notifyButtonTarget.disabled = true
          this.notifyButtonTarget.classList.add('opacity-50', 'pointer-events-none')
          this.notifyButtonTarget.innerHTML = 'Envoyé avec succès'
        }, 1000)
      })
      .catch(error => {
        const errorChildNode = `
          <span class="text-xs text-red-500 mt-2">
            Une erreur est survenue lors de la soumission de votre notification
          </span>`
        this.notifyFormTarget.appendChild(textToNode(errorChildNode))
      })
  }

  async buy(evt: ActionEvent) {
    const btn = evt.currentTarget as HTMLButtonElement
    if (!this.currentProductVariantValue) return

    this.setButtonLoading(true)

    try {
      const response = await fetch(`/checkout/${this.currentProductVariantValue.id}`)
      if (!response.ok) {
        const data = await response.json()
        if (response.status === 404 && data.error === 'product variant out of stock') {
          this.setOutOfStockVariant(this.currentProductVariantValue.id)
          this.updateStockStatus()
          this.setButtonLoading(false)
          return
        }
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const { checkout_session_url } = await response.json()
      window.location.href = checkout_session_url
    } catch (error) {
      console.error('Checkout error:', error)
      this.setButtonError(btn)
      this.setButtonLoading(false)
    }
  }

  private setButtonLoading(load: boolean) {
    this.buyButtonsTargets.forEach((el) => {
      if (load) {
        el.classList.add('cursor-wait', 'opacity-50', 'pointer-events-none')
        el.innerHTML = `
        ${animatedSpinner}
        Acheter
        `
      } else {
        el.classList.remove('cursor-wait', 'opacity-50', 'pointer-events-none')
        el.innerHTML = 'Acheter'
      }
    })
  }

  private setButtonError(btn: HTMLButtonElement) {
    btn.classList.remove('cursor-wait', 'opacity-50', 'pointer-events-none')
    btn.innerHTML = 'Réessayer'
  }


  minVariants() {
    const variants = this.productValue.product_variants[0].variants as Record<string, string>
    return Object.keys(variants).length
  }

  setOutOfStockVariant(id: string) {
    if (this.currentProductVariantValue && this.currentProductVariantValue.id === id) {
      this.currentProductVariantValue = { ...this.currentProductVariantValue, stock: 0 }
    }

    this.productValue = {
      ...this.productValue, product_variants: this.productValue.product_variants.map((variant) => {
        if (variant.id === id) {
          return { ...variant, stock: 0 }
        }
        return variant
      })
    }

  }


}

function textToNode(htmlString: string): HTMLElement {
  const template = document.createElement('template')
  template.innerHTML = htmlString.trim()
  return <HTMLElement>template.content.firstElementChild
}

