import Resource from './resource'

export default class Water extends Resource {
  colour = '#00f'
  ingestionRate = 0.02

  updateSensors() {
    const { amount, sensors } = this

    if (amount < 100) sensors.thirst = 5
    else if (amount < 200) sensors.thirst = 4
    else if (amount < 300) sensors.thirst = 3
    else if (amount < 400) sensors.thirst = 2
    else if (amount < 500) sensors.thirst = 1

    if (amount > 1900) sensors.illness += 5
    else if (amount > 1800) sensors.illness += 4
    else if (amount > 1700) sensors.illness += 3
    else if (amount > 1600) sensors.illness += 2
    else if (amount > 1500) sensors.illness += 1
  }

  updateActuators() {
    // Fatigue from hunger can reduce physical performance.
    const { amount, actuators } = this
    if (amount < 200) {
      const ratio = amount / 200
      actuators.clampSpeed(ratio)
      actuators.clampSidle(ratio)
    }
  }

  metabolize() {
    const {
      actuators: { sidle, speed },
    } = this

    const a = sidle * 0.001
    const b = speed * 0.0003

    super.metabolize(0.005 + a + b)
  }

  isUnconscious() {
    return this.amount < 100
  }

  isDead() {
    return this.amount <= 0 || this.amount > 2000
  }
}
