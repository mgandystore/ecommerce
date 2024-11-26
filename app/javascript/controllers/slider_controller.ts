import { ActionEvent, Controller } from '@hotwired/stimulus'
import Glide from '@glidejs/glide'
import '@glidejs/glide/dist/css/glide.core.min.css'
import '@glidejs/glide/dist/css/glide.theme.min.css'

export default class extends Controller {
  static targets = [ 'thumbnail' ]

  private glideSlider: Glide | undefined
  declare readonly thumbnailTargets: HTMLDivElement[]

  connect() {

    console.log("GLIDE =", Glide)


    const g = new Glide('.glide', {
      type: 'carousel',
      perView: 1,
    })

    g.mount()

    g.on('move.after', () => {
      this.slide(g.index, false)
    })

    this.glideSlider = g
  }

  disconnect() {
    this.glideSlider?.destroy()
  }

  goToSlide(evt: ActionEvent) {
    const index = evt.params.index
    this.slide(index, true)
  }

  slide(index: number, switchSlide: boolean) {
    this.thumbnailTargets.forEach((el) => {
      el.classList.remove('active')

      if (+el.dataset.sliderIndexParam! == index) {
        if (switchSlide) {
          this.glideSlider?.go(`=${index}`)
        }
        el.classList.add('active')
      }
    })
  }
}
