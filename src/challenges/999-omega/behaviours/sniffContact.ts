import { StepEvent } from '../../@types'
import { isNil } from '../../util'
import Actuators from '../actuators'
import Behaviour from '../behaviour'
import { radius } from '../physiology'
import { WhiskerInfo } from '../physiology/whiskers'
import Sensors from '../sensors'
import ContactMemory from '../tools/contactMemory'
import PathIntegrator from '../tools/pathIntegrator'
import ProcedureQueue from '../tools/procedureQueue'
import ReturnToOrigin from './returnToOrigin'
// import CircleAroundPoint from './circleAroundPoint'
// import MoveTowardPoint from './moveTowardPoint'

// Turns the head whisker toward an obstacle to get the texture.
export default class SniffContact extends Behaviour {
  contactMemory
  queue

  constructor(sensors: Sensors, actuators: Actuators) {
    super(sensors, actuators)
    this.contactMemory = new ContactMemory(sensors)
    this.queue = new ProcedureQueue()
  }

  sniffed = false
  isDone = false

  step(evt: StepEvent) {
    const { sensors, actuators, contactMemory, queue } = this
    const { whiskers } = sensors

    super.step(evt)
    contactMemory.step(evt)

    if (queue.done(evt)) {
      if (this.sniffed) {
        if (whiskers.has('h')) {
          // Turn until the head is no longer active.
          actuators.turn = -0.1
        } else {
          this.isDone = true
        }
      } else if (!isNil(this.sensors.noseScent) && !isNil(this.sensors.noseTexture)) {
        // TODO: save this somewhere?
        // debugger
        this.sniffed = true
      } else if (!whiskers.any()) {
        // No contacts. Check the contact memory to determine where recent contacts were.
        debugger
      } else if (whiskers.has('h')) {
        // Wait until the texture and the scent become available.
      } else {
        const info = whiskers.find(['hr', 'hl', 'r', 'l', 'tr', 'tl']) as WhiskerInfo
        // Turning may cause loss of contact, so this needs to be run until it is done.
        const contactPoint = whiskers.getContactPoint(info.id)
        const pi = new PathIntegrator(sensors)
        pi.reset(-contactPoint.x, -contactPoint.y)
        // Half way up the head whisker protrusion.
        const distance = whiskers.getProtrusion('h') / 2 + radius
        queue.add(new ReturnToOrigin(sensors, actuators, pi, { distance, stepPathIntegrator: true, maxSpeed: 2 }))
      }
    } else {
      queue.step(evt)
    }
  }

  defaultDone(_evt: StepEvent) {
    return this.isDone
  }
}
