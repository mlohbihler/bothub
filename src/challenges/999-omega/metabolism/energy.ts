import { maxTurn } from '../actuators'
import Resource from './resource'

export default class Energy extends Resource {
  colour = '#0f0'
  ingestionRate = 0.03

  updateSensors() {
    const { amount, sensors } = this

    if (amount < 100) sensors.hunger = 5
    else if (amount < 200) sensors.hunger = 4
    else if (amount < 300) sensors.hunger = 3
    else if (amount < 400) sensors.hunger = 2
    else if (amount < 500) sensors.hunger = 1
  }

  updateActuators() {
    // Fatigue from hunger can reduce physical performance.
    const { amount, actuators } = this
    if (amount < 300) {
      const ratio = (amount - 100) / 200
      actuators.clampSpeed(ratio)
      actuators.clampSidle(ratio)
    }
  }

  metabolize() {
    const {
      actuators: { sidle, speed, turn },
    } = this

    const a = sidle * 0.012
    const b = speed * 0.003
    const c = (turn / maxTurn) * 0.006

    super.metabolize(0.006 + a + b + c)
  }

  isUnconscious() {
    return this.amount < 100 || this.amount > 1500
  }

  isDead() {
    return this.amount <= 0
  }
}
