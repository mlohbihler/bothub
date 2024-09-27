import { Circle, Vec2, World } from 'planck'
import { FPS, rotate } from '../../planck/boxUtil'
import { StepEvent } from '../../@types'
import Sensors from './sensors'
import Actuators from './actuators'
import Controller from '../controller'
import { shorten } from '../../util'

const offsetX = 0
const offsetY = 0
const angle = 0
export const radius = 10
const agentBodyId = 'agentBody'

export default class Physiology {
  world
  bug
  body
  sensors
  actuators
  controller

  constructor(world: World, controller: Controller) {
    this.world = world

    this.bug = world.createDynamicBody({
      angle: angle,
      linearDamping: 0.1,
      position: Vec2(offsetX, offsetY),
    })
    this.body = this.bug.createFixture({
      userData: agentBodyId,
      shape: Circle(radius),
    })
    this.body.style.stroke = '#400'
    this.body.style.fill = '#0088ff'

    this.sensors = new Sensors()
    this.actuators = new Actuators()
    this.controller = controller
  }

  step(evt: StepEvent) {
    const { actuators, bug, controller, sensors } = this

    // Step the controller.
    controller.step(evt, sensors, actuators)

    // Clamp actuator values to agent maximums.
    actuators.clampTurn(1)
    actuators.clampSpeed(1)
    actuators.clampSidle(1)

    // Read the actuators
    // Sleeping.set(bug, false)
    bug.setAngle(bug.getAngle() + actuators.turn)
    bug.setLinearVelocity(rotate(Vec2(actuators.speed * FPS, actuators.sidle * FPS), bug.getAngle()))
    evt.debugProps.Turn = shorten(actuators.turn)
    evt.debugProps.Speed = shorten(actuators.speed)
    evt.debugProps.Sidle = shorten(actuators.sidle)
  }
}
