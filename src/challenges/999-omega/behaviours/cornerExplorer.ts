import CornerRecorder from '../tools/cornerRecorder'
import Behaviour from '../behaviour'
import CircleAroundPoint from './circleAroundPoint'
import FollowWall from './followWall'

export default class CornerExplorer extends Behaviour {
  constructor(sensors, actuators, convex) {
    super(sensors, actuators)

    this.follow = new FollowWall(sensors, actuators)
    this.cornerRecorder = new CornerRecorder(sensors)
    this.convex = convex
  }

  step(evt) {
    super.step(evt)

    const { sensors, actuators } = this
    const { whiskers } = sensors

    this.cornerRecorder.step(evt)
    if (!whiskers.any()) {
      // debugger
      actuators.turn = 0.05
    } else {
      if (this.convex) {
        this.stepConvex(evt)
      } else {
        this.follow.step(evt)
      }
      this.actuators.speed = 0.5
    }

    // if (cornerDetected) {
    //   // TODO two corners very close to each other may cause the second to be missed.
    //   if (!this.cornerExplorer) {
    //     this.cornerExplorer = new CornerRecorder(this.sensors)
    //   }
    // }

    // if (this.cornerExplorer) {
    //   actuators.speed = 1

    //   this.cornerExplorer.step(evt)
    //   // TODO something better?
    //   if (this.cornerExplorer.points.length > 100) {
    //     this.cornerExplorer = null
    //   }
    // } else {
    //   actuators.speed = 2
    // }
  }

  stepConvex(evt) {
    const { sensors, actuators } = this
    const { whiskers } = sensors
    const side = whiskers.anyLeft() ? 'l' : 'r'
    const headSide = `h${side}`

    if (!whiskers.has(headSide)) {
      if (sensors.bodyContacts.length) {
        actuators.speed = 1
      } else {
        // Rotate until the head side is touching again.
        if (!this.rotate) {
          this.rotate = new CircleAroundPoint(sensors, actuators, whiskers.getContactPoint(side))
        }
        this.rotate.step(evt)
      }
    } else {
      this.follow.step(evt)
    }
  }

  done(evt) {
    return this.cornerRecorder.points.length >= 50
  }
}
