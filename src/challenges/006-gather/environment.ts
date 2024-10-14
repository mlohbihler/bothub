import { Body, Polygon, Vec2, World } from 'planck'
import Physiology, { radius } from './physiology'
import { IEnvironment, StepEvent, Steppable } from '../../@types'
import Controller from '../controller'
import { FPS, regularPolygonVertices } from '../../planck/boxUtil'
import Transition from '../../transition'
import Rectangle from '../../planck/rectangle'
import { drawOffscreenDirection } from '../challengeUtil'

export default class Environment implements IEnvironment {
  steppables: Steppable[] = []
  goal
  agent
  target

  constructor(world: World, controller: Controller) {
    const targetLocation = Vec2(305, -300)
    this.agent = new Physiology(world, controller, targetLocation)

    this.target = world.createDynamicBody({
      linearDamping: 5,
      angularDamping: 1,
      position: targetLocation,
    })
    this.target.createFixture({ shape: Polygon(regularPolygonVertices(5, 4)), density: 0.01 })
    this.target.style = { fill: '#4c4c', stroke: '#4f4f' }

    this.goal = new Goal(this.agent, this.target)
    this.steppables.push(this.agent, this.goal)
  }

  step(evt: StepEvent) {
    this.steppables.forEach(e => e.step(evt))
  }

  render(cx: CanvasRenderingContext2D, viewport: Rectangle) {
    this.goal.render(cx)
    drawOffscreenDirection(cx, this.agent.bug.getPosition(), viewport)
  }

  isComplete() {
    return this.goal.isComplete()
  }
}

class Goal implements Steppable {
  agent
  target
  goalCenter = Vec2(0, 0)
  goalDistanceSq = Math.pow(30 - radius, 2)

  constructor(agent: Physiology, target: Body) {
    this.agent = agent
    this.target = target
  }

  timestamp = 0
  goalDisabled = false
  goalAchieved = false
  goalDisableRadius: undefined | Transition

  step(evt: StepEvent) {
    this.timestamp = evt.timestamp
    this.goalDisabled ||= !this.goalAchieved && !!evt.keyEvents.length
    this.goalAchieved ||=
      !this.goalDisabled && Vec2.distanceSquared(this.goalCenter, this.target.getPosition()) < this.goalDistanceSq
  }

  render(cx: CanvasRenderingContext2D) {
    let goalRadius = Math.sin(this.timestamp * 3) * 4 + 30
    if (this.goalDisabled) {
      if (this.goalDisableRadius === undefined) {
        this.goalDisableRadius = new Transition(goalRadius, 0, 2 * FPS)
      } else {
        goalRadius = this.goalDisableRadius.next()
      }
    }
    if (goalRadius > 0) {
      if (this.goalDisabled) {
        cx.fillStyle = '#8882'
        cx.strokeStyle = '#8888'
      } else if (this.goalAchieved) {
        cx.fillStyle = '#0f02'
        cx.strokeStyle = '#0f08'
      } else {
        cx.fillStyle = `#ff01`
        cx.strokeStyle = `#ff08`
      }
      cx.lineWidth = 1.5
      cx.beginPath()
      cx.ellipse(this.goalCenter.x, this.goalCenter.y, goalRadius, goalRadius, 0, 0, Math.PI * 2)
      cx.fill()
      cx.stroke()
    }
  }

  isComplete() {
    return this.goalAchieved
  }
}
