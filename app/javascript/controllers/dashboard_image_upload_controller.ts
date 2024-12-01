import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["preview", "input", "template"]
  static values = { model: String }

  declare readonly previewTarget: HTMLDivElement
  declare readonly inputTarget: HTMLInputElement
  declare readonly templateTarget: HTMLTemplateElement
  declare readonly modelValue: string

  connect() {
  }

  addImage() {
    this.inputTarget.click()
  }

  handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement
    if (!input.files?.length) return

    // Store the current files in a temporary array
    const currentFiles = Array.from(input.files)

    // Create a new FileList from existing previews
    const existingFiles = new DataTransfer()

    // If there are already files in the input, add them first
    if (input.files) {
      currentFiles.forEach(file => {
        existingFiles.items.add(file)
      })
    }

    // Update the input's files
    input.files = existingFiles.files

    // Create previews for new files
    currentFiles.forEach(file => {
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