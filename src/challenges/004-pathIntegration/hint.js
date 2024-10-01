// See the info (i) dialog for details about this challenge.

const step = (evt, sensors, actuators) => {}

//
// SPOILER ALERT!
//
// The below code seems to work ppretty well.
// class PathIntegrator {
//   // The difference from the original agent angle.
//   angle = 0
//   // The displacement from the original location wrt the original angle.
//   displacement = GID.Vec2()

//   step(sensors) {
//     this.angle += sensors.prevAngularVelocityAchieved
//     const diff = GID.rotate(sensors.prevVelocityAchieved, this.angle)
//     this.displacement.add(diff)
//   }

//   distance() {
//     return this.displacement.length()
//   }

//   returnAngle() {
//     return GID.vectorAngle(GID.Vec2.neg(this.displacement))
//   }

//   returnAngleDiff() {
//     return GID.minimizeAngle(this.returnAngle() - this.angle)
//   }

//   minimizedAngle() {
//     return GID.minimizeAngle(this.angle)
//   }
// }

// const pint = new PathIntegrator()
// let mode = 'sallyForth'
// let contactMade = false
// const step = (evt, sensors, actuators) => {
//   pint.step(sensors)
//   contactMade ||= sensors.contact

//   if (mode === 'sallyForth') {
//     // The other bodies are around 200 units out.
//     if (pint.distance() < 200) {
//       actuators.speed = 2
//     } else {
//       mode = 'turn'
//     }
//   } else if (mode === 'turn') {
//     const minAngle = pint.minimizedAngle()
//     if (minAngle < Math.PI / 2) {
//       actuators.turn = Math.PI - minAngle
//     } else {
//       mode = 'makeContact'
//     }
//   } else if (mode === 'makeContact') {
//     if (contactMade) {
//       mode = 'return'
//     } else {
//       // Assume that there will be a body to contact if we
//       // make a circle around the starting point at a radius
//       // of around 200 units. We can use the PI to maintain
//       // our distance.
//       actuators.speed = 1
//       actuators.turn = Math.min((pint.distance() - 200) / 10, 0.02)
//     }
//   } else if (mode === 'return') {
//     if (pint.distance() > 5) {
//       actuators.turn = pint.returnAngleDiff()
//       actuators.speed = pint.distance()
//     } else {
//       mode = 'done'
//     }
//   }

//   // evt.debugProps.xDiff = sensors.prevVelocityAchieved.x
//   // evt.debugProps.yDiff = sensors.prevVelocityAchieved.y
//   // evt.debugProps.aDiff = sensors.prevAngularVelocityAchieved
//   evt.debugProps.Contact = contactMade
//   // evt.debugProps.PiDistance = GID.shorten(pint.distance())
//   // evt.debugProps.PiDisplacementX = GID.shorten(pint.displacement.x)
//   // evt.debugProps.PiDisplacementY = GID.shorten(pint.displacement.y)
//   // evt.debugProps.PiAngle = pint.angle
//   // evt.debugProps.PiReturnAngle = pint.returnAngle()
//   evt.debugProps.Mode = mode
// }

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
