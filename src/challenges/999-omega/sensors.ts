import { Vec2 } from 'planck'
import Whiskers from './physiology/whiskers'
import ContactMemory from './tools/contactMemory'
import { AttributeValue } from './environment/attributes/attribute'
import Ambience from './environment/attributes/ambience'

export interface BodyContact {
  angle: number
  normalImpulse: number
  tangentImpulse: number
}

export default class Sensors {
  // The amount of actuation that the controller wanted in the previous timestep. The controller
  // can wanted anything, but because of phsiological constraints may not be able to achieve it.
  prevTurnWanted = 0
  prevSpeedWanted = 0
  prevSidleWanted = 0

  // The amount of actuation the agent was able to actually attempt base on physiological
  // constraints. Constraints include maximum strength, and possibly fatigue and illness.
  prevTurnAttempted = 0
  prevSpeedAttempted = 0
  prevSidleAttempted = 0

  // The actual amount of translational movement (WRT the nose) made in the previous step
  prevVelocityAchieved = Vec2()
  // The actual amount of orientation change made in the previous step
  prevAngularVelocityAchieved = 0

  // The angles of contacts made with the agent body.
  bodyContacts: BodyContact[] = []
  whiskers = new Whiskers()

  hunger = 0
  thirst = 0
  illness = 0
  fatigue = 0

  drinking = false
  eating = false

  internalState = {}
  events: { [key: string]: any } = {}

  noseTexture?: AttributeValue
  noseScent?: AttributeValue
  ambience: AttributeValue = 0
  contactMemory?: ContactMemory

  clear() {
    // Only update certain values here. Some are set at the end of the last step by the
    // physiology and should not be cleared.
    this.events = {}
    this.bodyContacts = []
    this.whiskers.clear()
    this.drinking = false
    this.eating = false
    this.noseTexture = undefined
    this.noseScent = undefined
  }
}
