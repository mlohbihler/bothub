import { createElement, getRequiredElementById } from './util'

// @ts-ignore
import CloseButton from './assets/svg/fa-close.svg?raw'

export default class Modal {
  veilElement
  contentElement

  visible = true
  escapeHandler

  constructor(veidId: string, contentId: string, closeId: string) {
    this.veilElement = getRequiredElementById(veidId)
    this.contentElement = getRequiredElementById(contentId)

    const close = getRequiredElementById(closeId)
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
    this.veilElement.style.opacity = '1' // Prevents the modal from flashing upon page load.
  }

  show() {
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
