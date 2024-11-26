import { Controller } from '@hotwired/stimulus'
import { useIntersection } from 'stimulus-use'

export default class extends Controller {

  static values = { name: String }

  declare readonly nameValue: string

  connect() {
    console.log("connect visibility controller")
    useIntersection(this)
  }

  appear() {
    this.dispatch(`${this.nameValue}-visibility`, {
      detail: {
        visible: true
      }
    })
  }

  disappear() {
    this.dispatch(`${this.nameValue}-visibility`, {
      detail: {
        visible: false
      }
    })
  }
}
