import { createElement, getRequiredElementById } from './util'
// @ts-ignore
import CloseButton from './assets/svg/fa-close.svg?raw'

export default class ErrorMessage {
  containerElement
  contentElement

  visible = true
  timeout: NodeJS.Timeout | undefined

  constructor(containerId: string, contentId: string, closeId: string) {
    this.containerElement = getRequiredElementById(containerId)
    this.contentElement = getRequiredElementById(contentId)

    const close = getRequiredElementById(closeId)
    createElement(close, CloseButton)
    close.addEventListener('click', () => this.hide())
    this.hide()
  }

  show(err: unknown) {
    console.error(err)

    this.contentElement.innerText = this.errorToText(err)
    this.visible = true

    // Change content immediately
    clearTimeout(this.timeout)
    this.containerElement.style.display = ''
    this.containerElement.style.opacity = '1'

    this.containerElement.style.backgroundColor = '#f88f'
    this.timeout = setTimeout(() => {
      this.containerElement.style.backgroundColor = '#fff4'
    }, 1000)
  }

  hide() {
    if (this.visible) {
      this.visible = false

      // Begin the transition
      this.containerElement.style.opacity = '0'

      // Change content and visibility only after a delay
      this.timeout = setTimeout(() => {
        this.contentElement.innerText = ''
        this.containerElement.style.display = 'none'
      }, 1000)
    }
  }

  errorToText(err: unknown) {
    if (err instanceof Error) {
      if (err.stack) {
        let lines = err.stack.split('\n')
        // Find the first index after the first element that doesn't include the file name where
        // the script was evaluated.
        let toIndex = lines.findIndex((line, index) => index > 0 && !line.includes(`eval at #updateStepFunction`))
        // toIndex = Math.max(toIndex - 1, 1)
        lines = lines.slice(0, toIndex)

        // Remove the noise in the text, and fix the line number, which is always 2 too high.
        const regex1 = /\s+at (\w+) .*?, <anonymous>:(\d+):(\d+)/
        const regex2 = /.*?, <anonymous>:(\d+):(\d+)/
        return lines
          .map((line, index) => {
            if (index === 0) return line
            let result = regex1.exec(line)
            if (result) {
              const [_, name, lineNumber, column] = result
              return `    at ${name} (<playerScript>:${parseInt(lineNumber) - 2}:${column})`
            }
            result = regex2.exec(line)
            if (result) {
              const [_, lineNumber, column] = result
              return `    at step (<playerScript>:${parseInt(lineNumber) - 2}:${column})`
            }
            return line
          })
          .join('\n')
      }

      return err.message
    }

    return err?.toString() || ''
  }
}
