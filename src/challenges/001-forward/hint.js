// Welcome!!
//
// You'll want to read all of this...
//
// This challenge is like a "hello world". All you have to do is
// get the agent (the solid blue circle) into the target area
// (the yellow circle). This will help you learn how all this
// works.
//
// The `step` function runs 60 times a second (usually). The
// sensors tell what the agent "knows" at the given moment,
// which in this challenge isn't much, but later this will
// include what the agent can see, feel, taste, smell, ...
// that sort of thing.
//
// Actuators are what the agent can do. Again, in this challenge
// it can only move forward and back using the `speed` attribute,
// and turn using the `turn` attribute.
const step = (evt, sensors, actuators) => {
  // Debug props allow you to see in the interface how things
  // are changing. Here we add the `Time` key and set it to
  // the current timestamp value in the step event object. You
  // can see it in action below the controls to the right.
  evt.debugProps.Time = GID.formatTime(evt.timestamp)

  // Uncomment the line below and press Ctrl-s to save your
  // script. This will complete this challenge.
  // actuators.speed = 1

  // If you want to see what turning looks like, uncomment
  // the line below.
  // actuators.turn = 0.05
}

// If you feel like playing around, the setup code below creates
// key handlers that will allow you to move the agent using your
// arrow keys. Uncomment to try it out.

// Note that it doesn't count to use the keyboard to solve
// challenges. You have to use only code.

// const setup = () => {
//   return {
//     keyHandlers: [
//       // Allow control of the agent from the keyboard
//       {
//         keyCode: 'ArrowUp',
//         action: 'repeat',
//         run: (actuators, evt) => (actuators.speed += evt.shiftKey ? 10 : 2),
//       },
//       {
//         keyCode: 'ArrowDown',
//         action: 'repeat',
//         run: actuators => (actuators.speed += -1),
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
