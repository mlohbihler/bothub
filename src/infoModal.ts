import { createElement, getRequiredElementById } from './util'
// @ts-ignore
import CloseButton from './assets/svg/fa-close.svg?raw'
import Challenge from './challenges/challenge'

export default class InfoModal {
  veilElement
  containerElement
  contentElement

  visible = true
  escapeHandler

  constructor() {
    this.veilElement = getRequiredElementById('infoModalVeil')
    this.containerElement = getRequiredElementById('infoModal')
    this.contentElement = getRequiredElementById('infoModalContent')

    const close = getRequiredElementById('infoModalClose')
    createElement(close, CloseButton)
    close.addEventListener('click', () => this.hide())
    this.hide()

    this.veilElement.addEventListener('click', evt => {
      if (evt.currentTarget === evt.target) {
        // Only close if it was the veil that was clicked on.
        this.hide()
      }
    })
    this.escapeHandler = (evt: KeyboardEvent) => {
      if (evt.key === 'Escape') {
        this.hide()
      }
    }
    this.veilElement.style.opacity = '1'
  }

  show(challenge: Challenge) {
    this.contentElement.innerHTML = challenge.getInfo()

    this.visible = true
    this.veilElement.style.display = ''
    document.addEventListener('keydown', this.escapeHandler)
  }

  hide() {
    if (this.visible) {
      this.visible = false
      this.veilElement.style.display = 'none'
      document.removeEventListener('keydown', this.escapeHandler)
    }
  }
}
