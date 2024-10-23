// See the info (i) dialog for details about this challenge.

// Join the discord server for hints and solutiuons.

const step = (evt, sensors, actuators) => {
  evt.debugProps.Contact = sensors.contactAngle || ''
  evt.debugProps.TargetDistance = sensors.targetDistance
  evt.debugProps.TargetAngleDiff = sensors.targetAngleDiff
  evt.debugProps.GoalDistance = sensors.goalDistance
  evt.debugProps.GoalAngleDiff = sensors.goalAngleDiff
}

const setup = () => {
  return {
    keyHandlers: [
      // Allow control of the agent from the keyboard
      {
        keyCode: 'ArrowUp',
        action: 'repeat',
        run: (actuators, evt) => (actuators.speed += evt.shiftKey ? 10 : 1),
      },
      {
        keyCode: 'ArrowDown',
        action: 'repeat',
        run: actuators => (actuators.speed += -0.5),
      },
      {
        keyCode: 'ArrowLeft',
        action: 'repeat',
        run: (actuators, evt) => (actuators.turn += evt.shiftKey ? 0.1 : 0.02),
      },
      {
        keyCode: 'ArrowRight',
        action: 'repeat',
        run: (actuators, evt) => (actuators.turn += evt.shiftKey ? -0.1 : -0.02),
      },
    ],
  }
}
