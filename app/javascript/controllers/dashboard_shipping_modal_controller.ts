// shipping_modal_controller.ts
import { Controller } from "@hotwired/stimulus"


export default class extends Controller {
  static targets = ["dialog", "form", "status", "carrierName", "trackingNumber", "error"]

  declare dialogTarget: HTMLDialogElement
  declare formTarget: HTMLFormElement
  declare statusTarget: HTMLSelectElement
  declare carrierNameTarget: HTMLSelectElement
  declare trackingNumberTarget: HTMLInputElement
  declare errorTarget: HTMLDivElement

  isConfirmed: boolean = false

  submitForm(event: Event) {
    if (this.isConfirmed) return

    event.preventDefault()

    if (this.statusTarget.value === "shipped") {
      this.errorTarget.classList.add('hidden')
      this.dialogTarget.showModal()
    } else {
      this.formTarget.submit()
    }
  }

  confirm() {
    if (!this.carrierNameTarget.value || !this.trackingNumberTarget.value) {
      this.errorTarget.classList.remove('hidden')
      return
    }

    this.isConfirmed = true
    this.dialogTarget.close()
    this.formTarget.submit()
  }

  close() {
    this.dialogTarget.close()
  }
}