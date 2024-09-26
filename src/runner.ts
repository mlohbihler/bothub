import { DebugProps, IEnvironment, StepEvent } from './@types'
import Challenge from './challenges/challenge'
import ErrorMessage from './errorMessage'
import Renderer from './planck/renderer'
import { DebugHelper, isNil } from './util'

export default class Runner {
  renderer
  challenge
  delta
  deltaMs
  timeoutId?: NodeJS.Timeout
  evt: StepEvent
  keyEvents: KeyboardEvent[] = []
  debugPropsElement
  errorMessage
  toggleRunner

  constructor(
    challenge: Challenge<IEnvironment>,
    renderer: Renderer,
    delta: number,
    debugPropsElement: HTMLElement,
    errorMessage: ErrorMessage,
    toggleRunner: () => void,
  ) {
    this.renderer = renderer
    this.challenge = challenge
    this.delta = delta
    this.deltaMs = delta * 1000
    this.debugPropsElement = debugPropsElement
    this.errorMessage = errorMessage
    this.toggleRunner = toggleRunner

    this.evt = {
      step: 0,
      timestamp: 0,
      debugProps: {},
      debugRenderers: [],
      keyEvents: this.keyEvents,
      debugHelper: new DebugHelper(renderer.getWorldCanvas()),
    }
  }

  addKeyEvent(evt: KeyboardEvent) {
    this.keyEvents.push(evt)
  }

  start() {
    this.timeoutId = setTimeout(() => this.#next(), 1)
  }

  #next() {
    const start = performance.now()
    if (this.tick()) {
      this.toggleRunner()
    } else {
      const delay = start + this.deltaMs - performance.now()
      // if (delay < 0) console.log('runner behind by', -delay)
      this.timeoutId = setTimeout(() => this.#next(), Math.max(delay, 0))
    }
  }

  tick() {
    const { evt } = this

    //
    // Advance the world
    evt.step += 1
    evt.timestamp = evt.step * this.delta
    this.challenge.getWorld().step(this.delta)

    const worldOffset = this.challenge.getWorldOffset()
    if (worldOffset) {
      // Center the agent in the renderer
      const canvasOffset = this.renderer.worldToCanvas(worldOffset.x, worldOffset.y)
      canvasOffset.x = this.renderer.cx.canvas.width / 2 - canvasOffset.x
      canvasOffset.y += this.renderer.cx.canvas.height / 2
      this.renderer.setOffset(canvasOffset.x, canvasOffset.y)
    }

    //
    // Then render it.
    this.render()
    this.renderer.inWorldCanvas(cx => {
      const h = new DebugHelper(cx)
      evt.debugRenderers.forEach(d => d(h))
    })

    //
    // Advance the environment.
    evt.debugProps = {}
    evt.debugRenderers = []
    evt.debugHelper = new DebugHelper(this.renderer.getWorldCanvas())

    let stop = false
    try {
      this.challenge.getEnvironment().step(evt)
    } catch (err) {
      this.errorMessage.show(err)
      stop = true
    }

    this.renderDebugProps(evt.debugProps)
    // Remove keyevents
    while (this.keyEvents.length) this.keyEvents.shift()

    return stop
  }

  render() {
    this.renderer.clear()
    this.challenge.render(this.renderer.getWorldCanvas())
    this.renderer.render(this.challenge.getWorld())
  }

  running() {
    return !isNil(this.timeoutId)
  }

  stop() {
    clearTimeout(this.timeoutId)
    this.timeoutId = undefined
  }

  reset() {
    this.evt.step = 0
    this.render()
    this.debugPropsElement.replaceChildren()
  }

  renderDebugProps(debugProps: DebugProps) {
    Object.keys(debugProps).map(k => {
      const id = `debugProps-${k}`
      const text = `${k}: ${debugProps[k]}`
      let ele = document.getElementById(id)
      if (!ele) {
        ele = document.createElement('span')
        ele.setAttribute('id', id)
        this.debugPropsElement.appendChild(ele)
      }
      if (ele.textContent !== text) {
        ele.textContent = text
      }
    })
  }
}
