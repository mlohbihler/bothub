import { Vec2, World } from 'planck'
import { IEnvironment, SetupOptions } from '../@types'
import Controller from './controller'

export default class Challenge {
  static getName() {
    throw 'not implemented'
  }
  static getLabel() {
    throw 'not implemented'
  }

  controller: Controller
  // @ts-ignore
  world: World
  // @ts-ignore
  environment: IEnvironment

  constructor() {
    this.controller = new Controller()
    this.reset()
  }

  getHint() {
    return ''
  }

  getInfo(): string {
    throw 'not implemented'
  }

  createEnvironment(): IEnvironment {
    throw 'not implemented'
  }

  getWorld(): World {
    return this.world
  }

  getEnvironment(): IEnvironment {
    return this.environment
  }

  getRendererOptions() {
    return {}
  }

  saveScript(script: string) {
    // Code for transpiling from typescript.
    // import { transpile } from 'typescript'
    // let result = transpile(code)

    const setupCode = `${script}; return typeof(setup) === 'undefined' ? {} : setup();`
    const setupOptions: SetupOptions = Function(setupCode)()
    this.controller.setup(setupOptions)

    const stepCode = `${script}; step(evt, sensors, actuators);`
    this.controller.updateStepFunction(Function('evt', 'sensors', 'actuators', stepCode))
  }

  reset() {
    this.world = new World()
    this.environment = this.createEnvironment()
  }

  getWorldOffset(): Vec2 | undefined {
    return undefined
  }
}
