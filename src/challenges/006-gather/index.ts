import { Vec2 } from 'planck'
import { RendererOptions } from '../../planck/renderer'
import Challenge from '../challenge'
import Environment from './environment'
import Rectangle from '../../planck/rectangle'

// @ts-ignore
import hint from './hint.js?raw'
// @ts-ignore
import info from './info.html?raw'

export default class Gather extends Challenge<Environment> {
  static getName() {
    return 'gather'
  }
  static getLabel() {
    return 'Gather'
  }

  getHint() {
    return hint
  }

  getInfo() {
    return info
  }

  createEnvironment(): Environment {
    return new Environment(this.getWorld(), this.getController())
  }

  getRendererOptions(): Partial<RendererOptions> {
    return {
      scaleFactor: 1.8,
      offset: Vec2(200, 200),
    }
  }

  getWorldOffset() {
    return undefined
  }

  render(cx: CanvasRenderingContext2D, viewport: Rectangle) {
    this.getEnvironment().render(cx, viewport)
  }

  isComplete() {
    return this.getEnvironment().isComplete()
  }
}
