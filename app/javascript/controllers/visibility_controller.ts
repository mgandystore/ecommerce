import { Controller } from '@hotwired/stimulus'
import { useIntersection } from 'stimulus-use'

export default class extends Controller {

  static values = { name: String }

  declare readonly nameValue: string

  connect() {
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
