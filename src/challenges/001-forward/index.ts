import { Vec2 } from 'planck'
import { RendererOptions } from '../../planck/renderer'
// @ts-ignore
import hint from './hint.js?raw'
// @ts-ignore
import info from './info.html?raw'
import Challenge from '../challenge'
import Environment from './environment'

export default class Forward extends Challenge<Environment> {
  static getName() {
    return 'forward' // 'hello world'?
  }
  static getLabel() {
    return 'Forward'
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
      offset: Vec2(200, 700),
      drawOrientations: true,
    }
  }

  getWorldOffset() {
    // return this.environment.getAgent().bug.getPosition()
    return undefined
  }

  render(cx: CanvasRenderingContext2D) {
    this.getEnvironment().render(cx)
  }
}
