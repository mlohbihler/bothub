import { Polygon, Vec2, World } from 'planck'
import Physiology, { radius } from './physiology'
import { IEnvironment, StepEvent, Steppable } from '../../@types'
import Controller from '../controller'
import { FPS, regularPolygonVertices, rotate } from '../../planck/boxUtil'
import Transition from '../../transition'

export default class Environment implements IEnvironment {
  steppables: Steppable[] = []
  goal

  constructor(world: World, controller: Controller) {
    const targetStyle = {
      fill: '#0a04',
      stroke: '#4f4f',
    }

    const agent = new Physiology(world, controller)

    const targetCenters: Vec2[] = []
    for (let i = 0; i < 5; i++) {
      const distance = 200 + Math.random() * 40 - 20
      const angle = Math.random() * 5 + Math.PI - 2.5
      const center = rotate(Vec2(distance, 0), angle, true)
      targetCenters.push(center)
      const body = world.createDynamicBody({
        linearDamping: 3,
        angularDamping: 1,
        position: center,
        angle: Math.random() * Math.PI * 2,
      })
      body.createFixture({ shape: Polygon(regularPolygonVertices(3, 3)), density: 0.01 })
      body.style = targetStyle
    }

    this.goal = new Goal(agent, targetCenters)
    this.steppables.push(agent, this.goal)
  }

  step(evt: StepEvent) {
    this.steppables.forEach(e => e.step(evt))
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
  targetCenters
  goalCenter = Vec2(0, 0)
  goalDistanceSq = Math.pow(30 - radius, 2)

  constructor(agent: Physiology, targetCenters: Vec2[]) {
    this.agent = agent
    this.targetCenters = targetCenters
  }

  timestamp = 0
  goalDisabled = false
  goalAchieved = false
  contactMade = false
  targetDisableRadius: number | undefined

  goalEnableFillOpacity = new Transition(0, 16, 2 * FPS)
  goalEnableStrokeOpacity = new Transition(0, 128, 2 * FPS)
  goalDisableRadius: number | undefined

  step(evt: StepEvent) {
    if (this.agent.bug.getContactList() !== null) {
      this.contactMade = true
    }
    this.timestamp = evt.timestamp

    this.goalDisabled ||= !this.goalAchieved && !!evt.keyEvents.length
    this.goalAchieved ||=
      !this.goalDisabled &&
      this.contactMade &&
      Vec2.distanceSquared(this.goalCenter, this.agent.bug.getPosition()) < this.goalDistanceSq
  }

  render(cx: CanvasRenderingContext2D) {
    let targetRadius = Math.sin(this.timestamp * 3) * 3 + 10
    if (this.contactMade || this.goalDisabled) {
      if (this.targetDisableRadius === undefined) {
        this.targetDisableRadius = targetRadius
      } else {
        this.targetDisableRadius -= 0.08
        targetRadius = this.targetDisableRadius
      }
    }

    if (targetRadius > 0) {
      cx.lineWidth = 0.5
      this.targetCenters.forEach(c => {
        if (this.contactMade || this.goalDisabled) {
          cx.strokeStyle = '#8888'
        } else {
          cx.strokeStyle = '#ff0'
        }
        cx.beginPath()
        cx.ellipse(c.x, c.y, targetRadius, targetRadius, 0, 0, Math.PI * 2)
        cx.stroke()
      })
    }

    if (this.contactMade) {
      let goalRadius = Math.sin(this.timestamp * 3) * 4 + 30
      if (this.goalDisabled) {
        if (this.goalDisableRadius === undefined) {
          this.goalDisableRadius = goalRadius
        } else {
          this.goalDisableRadius -= 0.35
          goalRadius = this.goalDisableRadius
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
          cx.fillStyle = `#ffff00${Math.floor(this.goalEnableFillOpacity.next()).toString(16).padStart(2, '0')}`
          cx.strokeStyle = `#ffff00${Math.floor(this.goalEnableStrokeOpacity.next()).toString(16).padStart(2, '0')}`
        }

        cx.lineWidth = 1.5
        cx.beginPath()
        cx.ellipse(this.goalCenter.x, this.goalCenter.y, goalRadius, goalRadius, 0, 0, Math.PI * 2)
        cx.fill()
        cx.stroke()
      }
    }
  }

  isComplete() {
    return this.goalAchieved
  }
}
