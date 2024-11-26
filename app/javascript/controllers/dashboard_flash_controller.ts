import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["container"]

  declare readonly containerTarget: HTMLElement

  connect() {
    console.log("FlashController connected")
    setTimeout(() => {
      this.fadeOut()
    }, 5000)
  }

  fadeOut() {
    this.containerTarget.classList.add('animate-fade-out')
    // Wait for the animation to fully complete before removing
    this.containerTarget.addEventListener('animationend', () => {
      this.containerTarget.remove()
    }, { once: true })
  }
}