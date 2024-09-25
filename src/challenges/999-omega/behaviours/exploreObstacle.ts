import FollowWall from './followWall'
import Behaviour from '../behaviour'
import ProcedureQueue from '../tools/procedureQueue'
import Move from './move'
import CornerExplorer from './cornerExplorer'
import { WhiskerDefs, WhiskerId } from '../physiology'
import Sensors from '../sensors'
import Actuators from '../actuators'
import { StepEvent, Steppable } from '../../@types'
import SniffObstacle from './sniffObstacle'
import OrientToWall from './orientToWall'
import { AttributeValue } from '../environment/attributes/attribute'

export default class ExploreObstacle extends Behaviour {
  texture?: AttributeValue
  lastContactIds?: WhiskerId[]
  follow?: Steppable
  reestablish?: ProcedureQueue
  corner?: CornerExplorer

  constructor(sensors: Sensors, actuators: Actuators) {
    super(sensors, actuators)

    // this.behaviour = new SniffObstacle(this.sensors, this.actuators)
    // this.behaviour = new OrientToWall(this.sensors, this.actuators)
    // this.behaviour = new FollowWall(this.sensors, this.actuators)

    this.initFollow()
  }

  initFollow() {
    const { sensors, actuators } = this
    const { whiskers } = sensors

    if (!this.follow) {
      if (!this.texture) {
        this.follow = new ProcedureQueue([
          new SniffObstacle(sensors, actuators).doneWhen((_evt: StepEvent) => {
            debugger
            if (sensors.noseTexture) {
              this.texture = sensors.noseTexture
              return true
            }
            return false
          }),
          new FollowWall(sensors, actuators),
        ])
      } else {
        this.follow = new FollowWall(sensors, actuators)
      }
    }
  }

  step(evt: StepEvent) {
    super.step(evt)
    const { sensors, actuators } = this
    const { events, whiskers } = sensors

    if (this.reestablish) {
      // Let this finish before resuming the follow.
      if (this.reestablish.done(evt)) {
        this.reestablish = undefined
        actuators.clear()
      } else {
        this.reestablish.step(evt)
      }
    } else if (this.corner) {
      this.corner.step(evt)
      if (this.corner.done(evt)) {
        this.corner = undefined
      }
    } else if (whiskers.any()) {
      this.initFollow()
      this.follow?.step(evt)
      this.lastContactIds = whiskers.ids()

      if (events.cornerDetected) {
        this.corner = new CornerExplorer(sensors, actuators, events.cornerDetected === 'convex')
      }
      // } else if (this.moveTowardPoint) {
      //   if (this.moveTowardPoint.done(evt)) {
      //     // MAYBELATER: what do we do if contact is not re-established?
      //     debugger
      //   }
      //   this.moveTowardPoint.step(evt)
    } else {
      if (!this.lastContactIds?.length) {
        // MAYBELATER: what do we do if there is no last contact?
        debugger
        return
      }

      const side = WhiskerDefs.side(this.lastContactIds)
      if (!side) {
        return
      }

      this.reestablish = new ProcedureQueue([
        // Reverse the previous movements
        new Move(sensors, actuators, 0, -sensors.prevVelocityAchieved.x, -sensors.prevVelocityAchieved.y, 10).doneWhen(
          (evt: StepEvent) => {
            if (whiskers.any()) {
              return true
            }
            if (this.defaultDone(evt)) {
              // Not able to reestablish contact within 10 moves.
              debugger
            }
            return false
          },
        ),
        new OrientToWall(sensors, actuators, side),
      ])
      this.reestablish.step(evt)

      // // Lost contact with the wall. Use the last contact ids to figure out how to move to try and
      // // re-establish.
      // const id = this.lastContactIds[0]
      // const angle = whiskers.getAngle(id)
      // const length = whiskers.getLength(id)
      // const point = Vector.rotate(Vector.create(length + 5, 0), angle)
      // this.moveTowardPoint = new MoveTowardPoint(sensors, actuators, point)
      // this.moveTowardPoint.step(evt)
    }
  }
}
