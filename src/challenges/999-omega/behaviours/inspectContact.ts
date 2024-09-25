// import PathIntegrator from '../tools/pathIntegrator'
// import CornerRecorder from '../tools/cornerRecorder'
// import FollowWall from './followWall'
// import OrientToWall from './orientToWall'
// import SniffObstacle from './sniffObstacle'
// import Spiral from './spiral'
import Behaviour from '../behaviour'
// import MoveTowardPoint from './moveTowardPoint'
// import { Vector } from 'matter-js'
// import ProcedureQueue from '../tools/procedureQueue'
// import Move from './move'
// import CornerExplorer from './cornerExplorer'
// import { WhiskerDefs } from '../physiology'

export default class InspectContact extends Behaviour {
  //   constructor(sensors, actuators) {
  //     super(sensors, actuators)
  //     // this.behaviour = new SniffObstacle(this.sensors, this.actuators)
  //     // this.behaviour = new OrientToWall(this.sensors, this.actuators)
  //     // this.behaviour = new FollowWall(this.sensors, this.actuators)
  //     this.initFollow()
  //   }
  //   texture
  //   lastContactIds
  //   initFollow() {
  //     const { sensors, actuators } = this
  //     const { whiskers } = sensors
  //     if (!this.follow) {
  //       if (!this.texture) {
  //         this.follow = new ProcedureQueue([
  //           new SniffObstacle(sensors, actuators).doneWhen(evt => {
  //             debugger
  //             if (texture) {
  //               this.texture = texture
  //               return true
  //             }
  //             return false
  //           }),
  //           new FollowWall(sensors, actuators),
  //         ])
  //       } else {
  //         this.follow = new FollowWall(sensors, actuators)
  //       }
  //     }
  //   }
  //   step(evt) {
  //     super.step(evt)
  //     const { sensors, actuators } = this
  //     const { events, whiskers } = sensors
  //     if (this.reestablish) {
  //       // Let this finish before resuming the follow.
  //       if (this.reestablish.done(evt)) {
  //         this.reestablish = null
  //         actuators.clear()
  //       } else {
  //         this.reestablish.step(evt)
  //       }
  //     } else if (this.corner) {
  //       this.corner.step(evt)
  //       if (this.corner.done()) {
  //         this.corner = null
  //       }
  //     } else if (whiskers.any()) {
  //       this.initFollow()
  //       this.follow.step(evt)
  //       this.lastContactIds = whiskers.ids()
  //       if (events.cornerDetected) {
  //         this.corner = new CornerExplorer(sensors, actuators, events.cornerDetected === 'convex')
  //       }
  //       // } else if (this.moveTowardPoint) {
  //       //   if (this.moveTowardPoint.done(evt)) {
  //       //     // MAYBELATER: what do we do if contact is not re-established?
  //       //     debugger
  //       //   }
  //       //   this.moveTowardPoint.step(evt)
  //     } else {
  //       if (!this.lastContactIds.length) {
  //         // MAYBELATER: what do we do if there is no last contact?
  //         debugger
  //       }
  //       this.reestablish = new ProcedureQueue([
  //         // Reverse the previous movements
  //         new Move(sensors, actuators, 0, -sensors.prevVelocityAchieved.x, -sensors.prevVelocityAchieved.y, 10).doneWhen((evt, move) => {
  //           if (whiskers.any()) {
  //             return true
  //           }
  //           if (move.defaultDone(evt)) {
  //             // Not able to reestablish contact within 10 moves.
  //             debugger
  //           }
  //         }),
  //         new OrientToWall(sensors, actuators, WhiskerDefs.side(this.lastContactIds)),
  //       ])
  //       this.reestablish.step(evt)
  //       // // Lost contact with the wall. Use the last contact ids to figure out how to move to try and
  //       // // re-establish.
  //       // const id = this.lastContactIds[0]
  //       // const angle = whiskers.getAngle(id)
  //       // const length = whiskers.getLength(id)
  //       // const point = Vector.rotate(Vector.create(length + 5, 0), angle)
  //       // this.moveTowardPoint = new MoveTowardPoint(sensors, actuators, point)
  //       // this.moveTowardPoint.step(evt)
  //     }
  //   }
}
