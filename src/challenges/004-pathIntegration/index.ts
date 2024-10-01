import { Vec2 } from 'planck'
import { RendererOptions } from '../../planck/renderer'
import Challenge from '../challenge'
import Environment from './environment'

// @ts-ignore
import hint from './hint.js?raw'
// @ts-ignore
import info from './info.html?raw'

export default class PathIntegration extends Challenge<Environment> {
  static getName() {
    return 'pathIntegration'
  }
  static getLabel() {
    return 'Path Integration'
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
      offset: Vec2(400, 600),
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
