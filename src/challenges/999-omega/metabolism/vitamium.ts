import Resource from './resource'

export default class Vitamium extends Resource {
  colour = '#f00'
  amount = 700
  ingestionRate = 0.005

  updateSensors() {
    const { amount, sensors } = this

    if (amount < 100) sensors.illness += 5
    else if (amount < 200) sensors.illness += 4
    else if (amount < 300) sensors.illness += 3
    else if (amount < 400) sensors.illness += 2
    else if (amount < 500) sensors.illness += 1
  }

  updateActuators() {
    const { amount, actuators } = this

    // Excess amounts of this can cause random turning.
    if (amount > 1000) {
      let factor = 1
      if (amount < 1500) {
        factor = (amount - 1000) / 500
      }
      const rand = (Math.random() - 0.5) * factor
      actuators.turn += rand
    }
  }

  metabolize() {
    super.metabolize(0.0001)
  }

  isUnconscious() {
    return false
  }

  isDead() {
    return this.amount <= 0
  }
}
