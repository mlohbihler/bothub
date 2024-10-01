import { Circle, Vec2, World } from 'planck'
import { FPS, rotate } from '../../planck/boxUtil'
import { StepEvent, Steppable } from '../../@types'
import Sensors from './sensors'
import Actuators from './actuators'
import Controller from '../controller'
import { blur, blurVector } from '../challengeUtil'

const offsetX = 0
const offsetY = 0
const angle = 0
export const radius = 10
const agentBodyId = 'agentBody'

export default class Physiology implements Steppable {
  world
  bug
  body
  sensors
  actuators
  controller

  previousPosition
  previousAngle

  constructor(world: World, controller: Controller) {
    this.world = world

    this.bug = world.createDynamicBody({
      angle: angle,
      linearDamping: 0.1,
      angularDamping: 10,
      position: Vec2(offsetX, offsetY),
    })
    this.body = this.bug.createFixture({
      userData: agentBodyId,
      shape: Circle(radius),
      density: 0.1,
    })
    this.body.style.stroke = '#400'
    this.body.style.fill = '#0088ff'
    this.body.style.drawOrientation = true

    this.sensors = new Sensors()
    this.actuators = new Actuators()
    this.controller = controller
    this.previousPosition = this.bug.getPosition()
    this.previousAngle = this.bug.getAngle()
  }

  step(evt: StepEvent) {
    const { actuators, bug, controller, sensors } = this

    // Update the sensors.
    const pos = bug.getPosition()
    const velocity = Vec2.sub(pos, this.previousPosition)
    sensors.prevVelocityAchieved = blurVector(rotate(velocity, -bug.getAngle(), true))
    sensors.prevAngularVelocityAchieved = blur(bug.getAngle() - this.previousAngle)
    this.previousPosition = Vec2(pos)
    this.previousAngle = bug.getAngle()

    sensors.contact = bug.getContactList() !== null

    // Step the controller.
    controller.step(evt, sensors, actuators)

    // Clamp actuator values to agent maximums.
    actuators.clampTurn(1)
    actuators.clampSpeed(1)
    actuators.clampSidle(1)

    bug.setAngle(bug.getAngle() + actuators.turn)
    bug.setLinearVelocity(rotate(Vec2(actuators.speed * FPS, actuators.sidle * FPS), bug.getAngle()))
  }
}
