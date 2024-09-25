import { Vec2 } from 'planck'
import { RendererOptions } from '../../planck/renderer'
// @ts-ignore
import hint from './hint.js?raw'
// @ts-ignore
import info from './info.html?raw'
import Challenge from '../challenge'
import Environment from './environment'
import { IEnvironment } from '../../@types'

export default class Forward extends Challenge {
  static getName() {
    return 'forward' // 'hello world'?
  }
  static getLabel() {
    return 'forward'
  }

  getHint() {
    return hint
  }

  getInfo() {
    return info
  }

  createEnvironment(): IEnvironment {
    return new Environment(this.world, this.controller)
  }

  getRendererOptions(): Partial<RendererOptions> {
    return {
      scaleFactor: 2,
      offset: Vec2(200, 700),
      drawOrientations: true,
    }
  }

  getWorldOffset() {
    // return (this.environment as Environment).getAgent().bug.getPosition()
    return undefined
  }
}
