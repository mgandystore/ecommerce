import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["preview", "input", "template"]
  static values = { model: String }

  declare readonly previewTarget: HTMLDivElement
  declare readonly inputTarget: HTMLInputElement
  declare readonly templateTarget: HTMLTemplateElement
  declare readonly modelValue: string

  connect() {
    console.log("ImageUploadController connected")
  }

  addImage() {
    this.inputTarget.click()
  }

  handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement
    if (!input.files?.length) return

    Array.from(input.files).forEach(file => {
      const reader = new FileReader()

      reader.onload = (e) => {
        const preview = this.templateTarget.content.cloneNode(true) as HTMLElement
        const img = preview.querySelector('img')
        if (img && e.target?.result) {
          img.src = e.target.result as string
        }
        this.previewTarget.appendChild(preview)
      }

      reader.readAsDataURL(file)
    })
  }

  removeImage(event: Event) {
    const button = event.currentTarget as HTMLButtonElement
    const preview = button.closest('.image-preview') as HTMLElement
    const imageId = preview.dataset.imageId

    if (imageId) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = this.modelValue + '[images_to_delete][]'
      input.value = imageId
      this.element.appendChild(input)
    }

    preview.remove()
  }
}