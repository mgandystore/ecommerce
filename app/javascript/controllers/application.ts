import { Application } from "@hotwired/stimulus"

const application = Application.start()

declare global {
  interface Window {
    Stimulus: any
  }
}


// Configure Stimulus development experience
application.debug = false
window.Stimulus   = application

export { application }
