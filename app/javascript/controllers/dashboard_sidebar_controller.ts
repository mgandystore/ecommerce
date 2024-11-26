import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ["menu"]

  declare menuTarget: HTMLElement
  declare hasMenuTarget: boolean

  initialize() {
    console.log("SidebarController initialized")
  }

  connect() {
    console.log("SidebarController connected")
    console.log("Menu target:", this.menuTarget)
    console.log("Has menu target:", this.hasMenuTarget)
    console.log("Element:", this.element)
  }
  toggle() {
    console.log("toggle")
    const isHidden = this.menuTarget.classList.contains('-translate-x-full')
    this.menuTarget.classList.toggle('-translate-x-full', !isHidden)
  }
}