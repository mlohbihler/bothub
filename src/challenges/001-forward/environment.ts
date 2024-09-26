import { Vec2, World } from 'planck'
import Physiology, { radius } from './physiology'
import { IEnvironment, StepEvent, Steppable } from '../../@types'
import Controller from '../controller'

export default class Environment implements IEnvironment {
  updatables: Steppable[] = []
  #agent

  goalCenter = Vec2(300, 0)
  goalDistanceSq = Math.pow(30 - radius, 2)

  timestamp = 0
  goalDisabled = false
  goalAchieved = false

  constructor(world: World, controller: Controller) {
    const agent = new Physiology(world, controller)
    this.#agent = agent
    this.updatables.push(agent)
  }

  getAgent() {
    return this.#agent
  }

  step(evt: StepEvent) {
    this.updatables.forEach(e => e.step(evt))

    this.timestamp = evt.timestamp
    this.goalDisabled ||= !!evt.keyEvents.length
    this.goalAchieved ||= Vec2.distanceSquared(this.goalCenter, this.#agent.bug.getPosition()) < this.goalDistanceSq
  }

  render(cx: CanvasRenderingContext2D) {
    let radius = Math.sin(this.timestamp * 3) * 4 + 30

    if (this.goalDisabled) {
      cx.fillStyle = '#8882'
      cx.strokeStyle = '#8888'
      radius = 30
    } else if (this.goalAchieved) {
      cx.fillStyle = '#0f02'
      cx.strokeStyle = '#0f08'
    } else {
      cx.fillStyle = '#ff01'
      cx.strokeStyle = '#ff08'
    }
    cx.lineWidth = 1.5

    cx.beginPath()
    cx.ellipse(300, 0, radius, radius, 0, 0, Math.PI * 2)
    cx.fill()
    cx.stroke()
  }
}
