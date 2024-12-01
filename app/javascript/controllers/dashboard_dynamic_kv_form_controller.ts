import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["template", "container"]

  declare readonly templateTarget: HTMLTemplateElement
  declare readonly containerTarget: HTMLDivElement

  connect(): void {
    if (this.containerTarget.children.length === 0) {
      this.addItem()
    }
  }

  addItem(event?: Event): void {
    event?.preventDefault()

    // Clone the template content
    const template = this.templateTarget.content.cloneNode(true) as DocumentFragment

    // Create and add the title input field
    const keyContainer = template.querySelector('.new_key')
    const keyName = keyContainer?.getAttribute('data-column')
    if (!keyName) {
      alert('Missing data-column attribute')
      return
    }
    if (keyContainer) {
      const titleInput = document.createElement('input')
      titleInput.type = 'text'
      titleInput.name = keyName
      titleInput.className = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
      keyContainer.appendChild(titleInput)
    }

    // Create and add the Trix editor
    const valueContainer = template.querySelector('.new_value')
    const valueName = valueContainer?.getAttribute('data-column')
    if (!valueName) {
      alert('Missing data-column attribute')
      return
    }
    if (valueContainer) {
      // Create hidden input for Trix
      const hiddenInput = document.createElement('input')
      hiddenInput.type = 'hidden'
      hiddenInput.name = valueName
      hiddenInput.id = `trix-input-${Date.now()}`

      // Create Trix editor element
      const trixEditor = document.createElement('trix-editor')
      trixEditor.setAttribute('input', hiddenInput.id)
      trixEditor.className = 'trix-content'

      // Append both elements
      valueContainer.appendChild(hiddenInput)
      valueContainer.appendChild(trixEditor)
    }

    // Add the new form item to the container
    this.containerTarget.insertAdjacentElement('beforeend', template.firstElementChild as HTMLElement)
  }

  removeItem(event: Event): void {
    event.preventDefault()
    const item = (event.target as HTMLElement).closest('.dynamic-form-item')

    if (this.containerTarget.children.length > 1 && item) {
      // Find and cleanup Trix editor before removing
      const trixEditor = item.querySelector('trix-editor')
      if (trixEditor) {
        // Remove the input attribute from the trix-editor element
        trixEditor.removeAttribute('input')
      }
      item.remove()
    }
  }
}