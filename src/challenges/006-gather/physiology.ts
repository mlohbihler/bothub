import { Circle, Vec2, World } from 'planck'
import { fixtureIntersectionPoints, FPS, rotate } from '../../planck/boxUtil'
import { StepEvent, Steppable } from '../../@types'
import Sensors from './sensors'
import Actuators from './actuators'
import Controller from '../controller'
import { blur, blurAngle, blurVector, PathIntegrator } from '../challengeUtil'

const offsetX = 0
const offsetY = 0
const angle = -Math.PI / 3
export const radius = 10
const agentBodyId = 'agentBody'

export default class Physiology implements Steppable {
  world
  bug
  body
  sensors
  actuators
  controller
  targetPathIntegrator
  goalPathIntegrator

  previousPosition
  previousAngle

  constructor(world: World, controller: Controller, targetLocation: Vec2) {
    this.world = world

    const bugLocation = Vec2(offsetX, offsetY)
    this.bug = world.createDynamicBody({
      angle: angle,
      linearDamping: 0.1,
      angularDamping: 10,
      position: bugLocation,
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

    const targetVector = Vec2.sub(bugLocation, targetLocation)
    const targetPathIntegrator = new PathIntegrator()
    targetPathIntegrator.angle = this.bug.getAngle()
    targetPathIntegrator.displacement = targetVector

    this.targetPathIntegrator = targetPathIntegrator
    this.goalPathIntegrator = new PathIntegrator()
  }

  step(evt: StepEvent) {
    const { actuators, bug, controller, sensors } = this

    this.targetPathIntegrator.step(sensors)
    this.goalPathIntegrator.step(sensors)

    // Update the sensors.
    const pos = bug.getPosition()
    const velocity = Vec2.sub(pos, this.previousPosition)
    sensors.prevVelocityAchieved = blurVector(rotate(velocity, -bug.getAngle(), true))
    sensors.prevAngularVelocityAchieved = blur(bug.getAngle() - this.previousAngle)
    sensors.targetAngleDiff = blurAngle(this.targetPathIntegrator.returnAngleDiff())
    sensors.targetDistance = blur(this.targetPathIntegrator.distance())
    sensors.goalAngleDiff = blurAngle(this.goalPathIntegrator.returnAngleDiff())
    sensors.goalDistance = blur(this.goalPathIntegrator.distance())
    this.previousPosition = Vec2(pos)
    this.previousAngle = bug.getAngle()

    const contactEdge = bug.getContactList()
    if (contactEdge === null || !contactEdge.contact.isTouching()) {
      sensors.contactAngle = undefined
    } else {
      const other = contactEdge.other
      let bugFixture
      let otherFixture
      if (contactEdge.contact.getFixtureA().getBody() === other) {
        bugFixture = contactEdge.contact.getFixtureB()
        otherFixture = contactEdge.contact.getFixtureA()
      } else {
        bugFixture = contactEdge.contact.getFixtureA()
        otherFixture = contactEdge.contact.getFixtureB()
      }

      const angle = fixtureIntersectionPoints(this.body, otherFixture, radius)[0]
      if (angle !== undefined) {
        sensors.contactAngle = blurAngle(angle)
      }
    }

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
