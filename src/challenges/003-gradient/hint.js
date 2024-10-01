// See the info (i) dialog for details about this challenge.

const step = (evt, sensors, actuators) => {}

// const setup = () => {
//   return {
//     keyHandlers: [
//       // Allow control of the agent from the keyboard
//       {
//         keyCode: 'ArrowUp',
//         action: 'repeat',
//         run: (actuators, evt) => (actuators.speed += evt.shiftKey ? 10 : 1),
//       },
//       {
//         keyCode: 'ArrowDown',
//         action: 'repeat',
//         run: actuators => (actuators.speed += -0.5),
//       },
//       {
//         keyCode: 'ArrowLeft',
//         action: 'repeat',
//         run: (actuators, evt) => (actuators.turn += evt.shiftKey ? 0.1 : 0.02),
//       },
//       {
//         keyCode: 'ArrowRight',
//         action: 'repeat',
//         run: (actuators, evt) => (actuators.turn += evt.shiftKey ? -0.1 : -0.02),
//       },
//     ],
//   }
// }

//
// SPOILER: this solution seems to work pretty well.
//
// The idea of this is that the agent starts by looking around it,
// finding the direction that has the highest amount. This is a
// little tricky because there could be no direction that improves on
// what it initially senses, or even possibly multiple directions
// that look like improvements. But once it decides on a direction,
// it move toward it a certain amount, and then repeats the process.
//
// class Turn {
//   turnAmount = 0.05
//   direction = 'neg'
//   totalTurn = 0
//   maxAmount

//   constructor(sensors) {
//     this.maxAmount = sensors.amount
//   }

//   step(evt, sensors, actuators) {
//     if (this.direction === 'center') {
//       if (this.totalTurn > 0) {
//         const turn = Math.min(this.turnAmount, this.totalTurn)
//         actuators.turn = -turn
//         this.totalTurn -= this.turnAmount
//       } else {
//         return true
//       }
//     } else {
//       if (this.direction === 'neg') {
//         if (sensors.amount < this.maxAmount || this.totalTurn > Math.PI) {
//           this.direction = 'pos'
//           this.totalTurn = 0
//         }
//         this.totalTurn += this.turnAmount
//       } else {
//         if (sensors.amount < this.maxAmount) {
//           // Found the boundaries of the highest amount.
//           this.totalTurn /= 2
//           this.direction = 'center'
//         } else if (sensors.amount > this.maxAmount) {
//           this.totalTurn = 0
//         } else {
//           this.totalTurn += this.turnAmount
//         }
//       }

//       actuators.turn = (this.direction === 'pos' ? 1 : -1) * this.turnAmount
//     }

//     this.maxAmount = Math.max(this.maxAmount, sensors.amount)
//     return false
//   }
// }

// class Move {
//   speed = 1
//   distance = 10

//   step(evt, sensors, actuators) {
//     if (this.distance > 0) {
//       const speed = Math.min(this.speed, this.distance)
//       actuators.speed = speed
//       this.distance -= this.speed
//     } else {
//       return true
//     }
//     return false
//   }
// }

// let behaviour
// const step = (evt, sensors, actuators) => {
//   if (!behaviour) {
//     behaviour = new Turn(sensors)
//   }

//   const done = behaviour.step(evt, sensors, actuators)
//   if (done) {
//     if (behaviour.constructor === Turn) {
//       behaviour = new Move()
//     } else {
//       behaviour = new Turn(sensors)
//     }
//   }
// }
