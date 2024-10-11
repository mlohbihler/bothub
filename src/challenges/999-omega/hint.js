// See the info (i) dialog for details about this challenge.

// NOTE: If you came here from a link, you should use the gear
// icon to check out the first challenge (forward), as that
// will give you a better introduction to this app.

// Utility that helps the agent rememeber where contacts were
// made, whisker, body, and nose. For convenience the contacts
// are drawn in the simulation. This uses the world position
// and angle for the agent, which in other challenges is not
// available. Contact memory can be used in conjunction with
// the path integrator to remember where edibles can be found.
class ContactMemory {
  memory = []
  pathIntegrator = new GID.PathIntegrator()

  step(evt, sensors) {
    const { memory, pathIntegrator } = this
    const { whiskers } = sensors
    pathIntegrator.step(sensors, evt)

    if (whiskers.any()) {
      whiskers.ids().forEach(id => {
        const distance = whiskers.getLength(id) - whiskers.getDepth(id)
        const angle = whiskers.getAngle(id) + pathIntegrator.angle
        const contactVector = GID.polarToCart(distance, angle)
        contactVector.add(pathIntegrator.displacement)
        const world = pathIntegrator.toWorld(contactVector)
        memory.push({ step: evt.step, type: 'whisker', id, world })
      })
    }

    sensors.bodyContacts.forEach(c => {
      const contactVector = GID.polarToCart(10, c.angle + pathIntegrator.angle)
      contactVector.add(pathIntegrator.displacement)
      const world = pathIntegrator.toWorld(contactVector)
      memory.push({ step: evt.step, type: 'body', ...c, world })
    })

    if (!GID.isNil(sensors.noseTexture) || !GID.isNil(sensors.noseScent)) {
      memory.push({ step: evt.step, type: 'nose', texture: sensors.noseTexture, scent: sensors.noseScent })
    }

    // Draw contacts on the canvas.
    memory.forEach(p => {
      if (p.step > evt.step - GID.FPS * 10) {
        const color = p.type === 'whisker' ? '#0aa' : p.type === 'body' ? '#a00' : null
        if (color) evt.debugRenderers.push(h => h.dot(p.world?.x || 0, p.world?.y || 0, 0.8, color))
      }
    })
    evt.debugProps.MemoryPoints = memory.length

    // Discard after 10 seconds
    while (memory.length && memory[0].step < evt.step - GID.FPS * 10) {
      memory.shift()
    }
  }
}

const contactMemory = new ContactMemory()
const step = (evt, sensors, actuators) => {
  contactMemory.step(evt, sensors)
}

const setup = () => {
  return {
    keyHandlers: [
      // Allow control of the agent from the keyboard
      {
        keyCode: 'ArrowUp',
        action: 'repeat',
        run: (actuators, evt) => (actuators.speed += evt.shiftKey ? 10 : 2),
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
      {
        keyCode: 'KeyD',
        action: 'debounce',
        run: (actuators, evt) => (actuators.startDrink = true),
      },
      {
        keyCode: 'KeyE',
        action: 'debounce',
        run: (actuators, evt) => (actuators.startEat = true),
      },
    ],
  }
}
