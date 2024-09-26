import { Vec2, World } from 'planck'
import { IEnvironment, SetupOptions } from '../@types'
import Controller from './controller'

export default class Challenge<E extends IEnvironment> {
  static getName() {
    throw 'not implemented'
  }
  static getLabel() {
    throw 'not implemented'
  }

  #controller: Controller
  // @ts-ignore
  #world: World
  // @ts-ignore
  #environment: E
  stepCode: string | undefined

  constructor() {
    this.#controller = new Controller()
    this.reset()
  }

  getHint() {
    return ''
  }

  getInfo(): string {
    throw 'not implemented'
  }

  createEnvironment(): E {
    throw 'not implemented'
  }

  getWorld(): World {
    return this.#world
  }

  getEnvironment(): E {
    return this.#environment
  }

  getRendererOptions() {
    return {}
  }

  getController() {
    return this.#controller
  }

  saveScript(script: string) {
    // Code for transpiling from typescript.
    // import { transpile } from 'typescript'
    // let result = transpile(code)

    const setupCode = `${script}; return typeof(setup) === 'undefined' ? {} : setup();`
    const setupOptions: SetupOptions = Function(setupCode)()
    this.#controller.setup(setupOptions)

    this.stepCode = `${script}; return step;`
    this.#updateStepFunction()
  }

  reset() {
    this.#world = new World()
    this.#environment = this.createEnvironment()
    // Reset the step function closure.
    this.#updateStepFunction()
  }

  #updateStepFunction() {
    this.#controller.updateStepFunction(Function(this.stepCode || '')())
  }

  getWorldOffset(): Vec2 | undefined {
    return undefined
  }

  render(_cx: CanvasRenderingContext2D) {}
}
