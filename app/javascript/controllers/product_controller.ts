import { ActionEvent, Controller } from '@hotwired/stimulus'
import { Product, ProductVariant } from '../types'
import { VariantSelectEvent, VariantType } from './product_variant_controller'

export default class extends Controller {
  static targets = [ 'price', 'fixedBuyBtnContainer' ]
  static values = {
    product: Object,
    price: Number,
    variantsSelected: { type: Object, default: {} },
    currentProductVariant: { type: Object, default: undefined },
  }


  declare readonly priceTarget: HTMLElement
  declare productValue: Product
  declare variantsSelectedValue: Record<string, string>
  declare currentProductVariantValue: ProductVariant | undefined
  declare readonly fixedBuyBtnContainerTarget: HTMLButtonElement

  connect() {
    console.log("connect product controller", this.productValue)
  }

  variantsSelectedValueChanged() {
    if (Object.keys(this.variantsSelectedValue).length < this.minVariants()) {
      console.warn("not enough variants selected")
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
      console.log("found product variant", someProductVariant.variants_slug)
      this.currentProductVariantValue = someProductVariant
    }
  }

  currentProductVariantValueChanged() {
    console.log("current product variant value changed", this.currentProductVariantValue)
    if (!this.currentProductVariantValue) {
      this.priceTarget.innerText = '— €'
      return
    }

    const priceAmount = this.productValue.base_price +  (this.currentProductVariantValue.additional_price ?? 0)
    const price = priceAmount.toString() ?? '?'
    this.priceTarget.innerText = `${+price / 100} €`
  }

  // variantSelected is dispatched by the ProductVariant controller
  variantSelectedEvent(evt: VariantSelectEvent) {
    console.log("variant selected event", evt.detail, "after", { ...this.variantsSelectedValue, [evt.detail.type]: evt.detail.variant })
    this.variantsSelectedValue = { ...this.variantsSelectedValue, [evt.detail.type]: evt.detail.variant }
  }

  buyBtnVisibilityEvent(evt: CustomEvent<{ visible: boolean }>) {
    this.setVisibilityFixedBuyBtnContainer(!evt.detail.visible)
  }

  footerVisibilityEvent(evt: CustomEvent<{ visible: boolean }>) {
    this.setVisibilityFixedBuyBtnContainer(!evt.detail.visible)
  }

  setVisibilityFixedBuyBtnContainer(visible: boolean) {
    if (visible) {
      this.fixedBuyBtnContainerTarget.classList.remove('max-sm:hidden')
      // # get the first button in child and set Acheter - {PRICE} € as text
      this.fixedBuyBtnContainerTarget.querySelector('button')!.innerText = `Acheter — ${this.priceTarget.innerText}`

    } else {
      this.fixedBuyBtnContainerTarget.classList.add('max-sm:hidden')
    }
  }


  buy(evt: ActionEvent) {
    const btn = evt.currentTarget as HTMLButtonElement
    btn.classList.add('cursor-wait', 'opacity-50', 'pointer-events-none')
    btn.innerHTML = `
    <svg aria-hidden="true" role="status" class="inline mr-2 w-4 h-4 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"></path>
      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1f2937"></path>
    </svg>
    Acheter
    `

    if (!this.currentProductVariantValue) {
      return
    }

    let id = this.currentProductVariantValue.id

    fetch(`/checkout/${id}`).then((res) => {
      return res.json()
    }).then(({ checkout_session_url }) => {
      window.location.href = checkout_session_url;
    })
  }

  minVariants() {
    const variants = this.productValue.product_variants[0].variants as Record<string, string>
    return Object.keys(variants).length
  }
}
