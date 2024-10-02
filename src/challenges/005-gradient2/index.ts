import { Vec2 } from 'planck'
import { RendererOptions } from '../../planck/renderer'
import Challenge from '../challenge'
import Environment from './environment'

// @ts-ignore
import hint from './hint.js?raw'
// @ts-ignore
import info from './info.html?raw'

export default class Gradient2 extends Challenge<Environment> {
  static getName() {
    return 'gradient2'
  }
  static getLabel() {
    return 'Gradient 2'
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
      scaleFactor: 1.3,
      offset: Vec2(200, 1000),
    }
  }

  getWorldOffset() {
    return undefined
  }

  render(cx: CanvasRenderingContext2D) {
    this.getEnvironment().render(cx)
  }

  isComplete() {
    return this.getEnvironment().isComplete()
  }
}
