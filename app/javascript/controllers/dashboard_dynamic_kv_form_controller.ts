// app/javascript/controllers/dynamic_form_controller.ts
import { Controller } from "@hotwired/stimulus"

// Define the controller
export default class extends Controller {
  static targets = ["template", "container"]

  declare readonly templateTarget: HTMLTemplateElement
  declare readonly containerTarget: HTMLDivElement
  declare readonly hasTemplateTarget: boolean
  declare readonly hasContainerTarget: boolean

  connect(): void {
    // If no items exist, add one empty item
    if (this.containerTarget.children.length === 0) {
      this.addItem()
    }
  }

  addItem(event?: Event): void {
    event?.preventDefault()

    // Generate a unique identifier for the new record
    const timestamp = new Date().getTime().toString()
    const content = this.templateTarget.innerHTML.replace(/NEW_RECORD/g, timestamp)

    // Insert the new item
    this.containerTarget.insertAdjacentHTML('beforeend', content)
  }

  removeItem(event: Event): void {
    event.preventDefault()
    const item = (event.target as HTMLElement).closest('.dynamic-form-item')

    // Don't remove if it's the last item
    if (this.containerTarget.children.length > 1 && item) {
      item.remove()
    }
  }
}