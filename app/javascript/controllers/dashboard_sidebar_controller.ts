import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ["menu"]

  declare menuTarget: HTMLElement
  declare hasMenuTarget: boolean

  initialize() {
  }

  connect() {
  }
  toggle() {
    const isHidden = this.menuTarget.classList.contains('-translate-x-full')
    this.menuTarget.classList.toggle('-translate-x-full', !isHidden)
  }
}