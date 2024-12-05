import { Controller } from "@hotwired/stimulus"
import Sortable from 'sortablejs';

export default class extends Controller {
  static targets = ["preview", "input", "template", 'imagesPositions']
  static values = { model: String }

  declare readonly previewTarget: HTMLDivElement
  declare readonly inputTarget: HTMLInputElement
  declare readonly templateTarget: HTMLTemplateElement
  declare readonly modelValue: string
  declare readonly imagesPositionsTarget: HTMLInputElement

  private sortable: Sortable | null = null
  private newFiles: Set<string> = new Set()

  connect() {
    this.initializeSortable()
  }

  disconnect() {
    this.sortable?.destroy()
  }

  private initializeSortable() {
    this.sortable?.destroy()

    this.sortable = Sortable.create(this.previewTarget, {
      handle: ".cursor-move",
      onChange: () => {
        this.updateFilePosition()
      }
    })
  }

  updateFiles() {
    this.updateFilePosition()
    this.initializeSortable()
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

    // Track how many files we're adding
    let filesProcessed = 0

    // Create previews for new files
    currentFiles.forEach(file => {
      const reader = new FileReader()

      this.newFiles.add(file.name)

      reader.onload = (e) => {
        const preview = this.templateTarget.content.cloneNode(true) as HTMLElement

        preview.querySelector('.sortable-item')?.setAttribute('data-image-id', file.name)

        const img = preview.querySelector('img')
        if (img && e.target?.result) {
          img.src = e.target.result as string
        }
        this.previewTarget.appendChild(preview)

        // Increment processed files counter
        filesProcessed++

        // Only update after all files have been processed
        if (filesProcessed === currentFiles.length) {
          this.updateFiles()
        }
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
    this.updateFiles()
  }

  private updateFilePosition() {
    const images = Array.from(this.previewTarget.children)
      .map((child, index) => {
        return {
          id: child.getAttribute('data-image-id'),
          position: index,
          new: this.newFiles.has(child.getAttribute('data-image-id') || '')
        }
      })

    this.imagesPositionsTarget.value = JSON.stringify(images)
  }
}