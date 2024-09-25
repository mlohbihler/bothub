import Sensors from './sensors'
import Actuators from './actuators'
import { StepEvent, Steppable } from '../../@types'
import Behaviour from './behaviour'
import Keyboard from './behaviours/keyboard'
import ContactMemory from './tools/contactMemory'
import Rest from './behaviours/rest'
import CircleAroundPoint from './behaviours/circleAroundPoint'
// import ExploreObstacle from './behaviours/exploreObstacle'
// import MoveTowardPoint from './behaviours/moveTowardPoint'
// import SniffContact from './behaviours/sniffContact'
import PathIntegrationTest from '../test/goid/behaviours/pathIntegrationTest'
import MoveTowardPointTest from '../test/goid/behaviours/moveTowardPointTest'
import CircleAroundPointTest from '../test/goid/behaviours/circleAroundPointTest'
import RandomExplore from './behaviours/randomExplore'

export default class Controller {
  sensors
  actuators
  keyboard
  test?: Steppable
  exploreObstacle?: Behaviour
  sniffContact?: Behaviour
  randomExplore?: Behaviour
  rest: Rest

  constructor(sensors: Sensors, actuators: Actuators) {
    this.sensors = sensors
    this.actuators = actuators
    // sensors.contactMemory = new ContactMemory(sensors)

    this.randomExplore = new RandomExplore(sensors, actuators)
    this.keyboard = new Keyboard(sensors, actuators)
    this.rest = new Rest(sensors, actuators)

    // this.test = new PathIntegrationTest(sensors, actuators)
    // this.test = new MoveTowardPointTest(sensors, actuators)
    // this.test = new CircleAroundPointTest(sensors, actuators)
  }

  step(evt: StepEvent) {
    const { sensors, actuators } = this
    const { whiskers } = this.sensors

    actuators.clear()
    sensors.contactMemory?.step(evt)

    if (this.test) {
      this.test.step(evt)
    } else {
      // if (!this.exploreObstacle && whiskers.any()) {
      //   this.exploreObstacle = new ExploreObstacle(sensors, actuators)
      // }
      // if (!this.sniffContact && whiskers.any()) {
      //   this.sniffContact = new SniffContact(sensors, actuators)
      // }

      if (this.exploreObstacle) {
        this.exploreObstacle.step(evt)
      } else if (this.sniffContact) {
        this.sniffContact.step(evt)
        if (this.sniffContact.done(evt)) this.sniffContact = undefined
      } else if (this.randomExplore) {
        this.randomExplore.step(evt)
      } else {
        this.rest.step(evt)
      }
    }

    this.keyboard.step(evt)
  }
}
