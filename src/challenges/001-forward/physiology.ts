import { Circle, Vec2, World } from 'planck'
import { FPS, rotate } from '../../planck/boxUtil'
import { StepEvent } from '../../@types'
import Sensors from './sensors'
import Actuators from './actuators'
import Controller from '../controller'
import { shorten } from '../../util'

const offsetX = 0
const offsetY = 0
const angle = 0 // 1
export const radius = 10
const sensorPrecision = 2
const agentBodyId = 'agentBody'

export default class Physiology {
  world
  bug
  body
  sensors
  actuators
  controller
  previousAngle
  previousPosition

  constructor(world: World, controller: Controller) {
    this.world = world

    this.bug = world.createDynamicBody({
      angle: angle,
      linearDamping: 0.1,
      position: Vec2(offsetX, offsetY),
    })
    this.body = this.bug.createFixture({
      // restitution: 0.8,
      userData: agentBodyId,
      shape: Circle(radius),
    })
    this.body.style.stroke = '#400'
    this.body.style.fill = '#0088ff'

    this.sensors = new Sensors()
    this.actuators = new Actuators()
    this.controller = controller
    this.previousAngle = this.bug.getAngle()
    this.previousPosition = this.bug.getPosition()
  }

  step(evt: StepEvent) {
    const { actuators, bug, controller, sensors } = this
    const pos = bug.getPosition()

    // Update sensors
    const velocity = Vec2.sub(pos, this.previousPosition)
    // Velocity is in the world FOR. Rotate to the agent FOR.
    sensors.prevVelocityAchieved = blurVector(rotate(velocity, -bug.getAngle(), true))
    sensors.prevAngularVelocityAchieved = blur(bug.getAngle() - this.previousAngle)
    this.previousAngle = bug.getAngle()
    this.previousPosition = Vec2(pos)

    // Step the controller.
    controller.step(evt, sensors, actuators)

    sensors.prevTurnWanted = actuators.turn
    sensors.prevSpeedWanted = actuators.speed
    sensors.prevSidleWanted = actuators.sidle

    // Clamp actuator values to agent maximums.
    actuators.clampTurn(1)
    actuators.clampSpeed(1)
    actuators.clampSidle(1)
    sensors.prevTurnAttempted = blurAngle(actuators.turn)
    sensors.prevSpeedAttempted = blur(actuators.speed)
    sensors.prevSidleAttempted = blur(actuators.sidle)

    // Read the actuators
    // Sleeping.set(bug, false)
    bug.setAngle(bug.getAngle() + actuators.turn)
    bug.setLinearVelocity(rotate(Vec2(actuators.speed * FPS, actuators.sidle * FPS), bug.getAngle()))
    evt.debugProps.Turn = `${shorten(actuators.turn)} (${shorten(sensors.prevTurnWanted)})`
    evt.debugProps.Speed = `${shorten(actuators.speed)} (${shorten(sensors.prevSpeedWanted)})`
    evt.debugProps.Sidle = `${shorten(actuators.sidle)} (${shorten(sensors.prevSidleWanted)})`
  }
}

const blur = (n: number) => Number(n.toPrecision(sensorPrecision))

const blurVector = (v: Vec2) => {
  v.x = Number(v.x.toPrecision(sensorPrecision))
  v.y = Number(v.y.toPrecision(sensorPrecision))
  return v
}

// Rounds numbers to the nearest 0.05
const blurAngle = (a: number) => Number((a * 2).toFixed(1)) / 2
