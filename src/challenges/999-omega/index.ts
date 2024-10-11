import { Vec2 } from 'planck'
import { RendererOptions } from '../../planck/renderer'
import Challenge from '../challenge'
import Environment from './environment'
import Rectangle from '../../planck/rectangle'

// @ts-ignore
import hint from './hint.js?raw'
// @ts-ignore
import info from './info.html?raw'

export default class AllDressed extends Challenge<Environment> {
  static getName() {
    return 'allDressed'
  }
  static getLabel() {
    return 'All Dressed'
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
      scaleFactor: 2,
      offset: Vec2(-500, 2300),
    }
  }

  getWorldOffset() {
    return undefined
  }

  render(cx: CanvasRenderingContext2D, viewport: Rectangle) {
    this.getEnvironment().render(cx, viewport)
  }

  isComplete() {
    return false
  }
}
