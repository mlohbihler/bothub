// See the info (i) dialog for details about this challenge.

// These examples *almost* work.

// Turn then move. True, this could be done using `evt.step`, but
// using state is a more generalizable solution.
// let state = 'turn'
// let count = 0
const step = (evt, sensors, actuators) => {
  // HINT: Use Ctrl+/ or ⌘/ to uncomment lines or selection blocks.
  // if (state === 'turn') {
  //   actuators.turn = 0.3
  //   count++
  //   if (count > 3) {
  //     state = 'move'
  //   }
  // } else {
  //   actuators.speed = 0.5
  // }
  //
  // evt.debugProps.Count = count
}

// Turn and move
// const step = (evt, sensors, actuators) => {
//   actuators.speed = 2
//   actuators.turn = 0.005
// }
