import { Vec2, World } from 'planck'
import Physiology, { radius } from './physiology'
import { IEnvironment, StepEvent, Steppable } from '../../@types'
import Controller from '../controller'
import { DebugHelper } from '../../util'
import Gradient from './gradient'
import Rectangle from '../../planck/rectangle'
import { drawOffscreenDirection } from '../offscreenDirection'

export default class Environment implements IEnvironment {
  updatables: Steppable[] = []
  gradient
  #agent
  goal

  constructor(world: World, controller: Controller) {
    this.gradient = new Gradient()
    const agent = new Physiology(world, controller, this.gradient)
    this.#agent = agent
    this.goal = new Goal(agent, this.gradient)
    this.updatables.push(agent, this.goal)
  }

  getAgent() {
    return this.#agent
  }

  step(evt: StepEvent) {
    this.updatables.forEach(e => e.step(evt))
  }

  render(cx: CanvasRenderingContext2D, viewport: Rectangle) {
    const h = new DebugHelper(cx)
    const range = this.gradient.range()
    const scale = this.gradient.scale
    for (let x = range.from.x; x < range.to.x; x += scale) {
      for (let y = range.from.y; y < range.to.y; y += scale) {
        const amount = this.gradient.amountAt(x, y)
        if (amount > 0) {
          const hex = Math.ceil((amount / (this.gradient.pathLength() + 1)) * 255).toString(16)
          h.dot(x + scale / 2, y + scale / 2, 11, `#3333ff${hex.padStart(2, '0')}`)
        }
      }
    }

    this.goal.render(cx)
    drawOffscreenDirection(cx, this.#agent.bug.getPosition(), viewport)
  }

  isComplete() {
    return this.goal.isComplete()
  }
}

const goalRadius = 11
class Goal implements Steppable {
  agent
  gradient
  goalCenters
  goalDistanceSq = Math.pow(goalRadius - radius, 2)
  completed = []

  constructor(agent: Physiology, gradient: Gradient) {
    this.agent = agent
    this.gradient = gradient
    const scale = gradient.scale
    this.goalCenters = gradient.getGoalCoordinates().map(([x, y]) => {
      return Vec2(x * scale + scale / 2, y * scale + scale / 2)
    })
  }

  timestamp = 0
  goalDisabled = false
  goalAchieved = false
  disableRadius: number | undefined

  step(evt: StepEvent) {
    this.timestamp = evt.timestamp
    this.goalDisabled ||= this.goalCenters.length > 0 && !!evt.keyEvents.length
    if (
      !this.goalDisabled &&
      this.goalCenters.length > 0 &&
      Vec2.distanceSquared(this.goalCenters[0], this.agent.bug.getPosition()) < this.goalDistanceSq
    ) {
      this.goalCenters.shift()
    }
  }

  render(cx: CanvasRenderingContext2D) {
    this.goalCenters.forEach((g, i) => {
      let radius
      if (this.goalDisabled) {
        cx.strokeStyle = '#8888'
        if (this.disableRadius === undefined) {
          this.disableRadius = goalRadius
        } else {
          this.disableRadius -= 0.01
        }
        radius = this.disableRadius
      } else if (i === 0) {
        cx.strokeStyle = '#ff0'
        radius = Math.sin(this.timestamp * 3) * 2 + goalRadius
      } else {
        cx.strokeStyle = '#ccc'
        radius = goalRadius
      }

      if (radius > 0) {
        cx.lineWidth = 0.5
        cx.beginPath()
        cx.ellipse(g.x, g.y, radius, radius, 0, 0, Math.PI * 2)
        cx.stroke()
      }
    })
  }

  isComplete() {
    return this.goalCenters.length === 0
  }
}
