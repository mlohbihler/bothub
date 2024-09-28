import { Vec2, World } from 'planck'
import Physiology, { radius } from './physiology'
import { IEnvironment, StepEvent, Steppable } from '../../@types'
import Controller from '../controller'

export default class Environment implements IEnvironment {
  updatables: Steppable[] = []
  #agent
  goal

  constructor(world: World, controller: Controller) {
    const agent = new Physiology(world, controller)
    this.#agent = agent
    this.goal = new Goal(agent)
    this.updatables.push(agent, this.goal)
  }

  getAgent() {
    return this.#agent
  }

  step(evt: StepEvent) {
    this.updatables.forEach(e => e.step(evt))
  }

  render(cx: CanvasRenderingContext2D) {
    this.goal.render(cx)
  }

  isComplete() {
    return this.goal.isComplete()
  }
}

class Goal implements Steppable {
  agent
  goalCenter = Vec2(300, 0)
  goalDistanceSq = Math.pow(30 - radius, 2)

  constructor(agent: Physiology) {
    this.agent = agent
  }

  timestamp = 0
  goalDisabled = false
  goalAchieved = false
  disableRadius: number | undefined

  step(evt: StepEvent) {
    this.timestamp = evt.timestamp
    this.goalDisabled ||= !this.goalAchieved && !!evt.keyEvents.length
    this.goalAchieved ||=
      !this.goalDisabled && Vec2.distanceSquared(this.goalCenter, this.agent.bug.getPosition()) < this.goalDistanceSq
  }

  render(cx: CanvasRenderingContext2D) {
    let radius = Math.sin(this.timestamp * 3) * 4 + 30

    if (this.goalDisabled) {
      cx.fillStyle = '#8882'
      cx.strokeStyle = '#8888'
      if (this.disableRadius === undefined) {
        this.disableRadius = radius
      } else {
        if (this.disableRadius > 0) {
          this.disableRadius -= 0.35
        }
        radius = this.disableRadius
      }
    } else if (this.goalAchieved) {
      cx.fillStyle = '#0f02'
      cx.strokeStyle = '#0f08'
    } else {
      cx.fillStyle = '#ff01'
      cx.strokeStyle = '#ff08'
    }

    if (radius > 0) {
      cx.lineWidth = 1.5

      cx.beginPath()
      cx.ellipse(this.goalCenter.x, this.goalCenter.y, radius, radius, 0, 0, Math.PI * 2)
      cx.fill()
      cx.stroke()
    }
  }

  isComplete() {
    return this.goalAchieved
  }
}
