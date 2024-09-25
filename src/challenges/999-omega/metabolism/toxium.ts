import Resource from './resource'

export default class Toxium extends Resource {
  colour = '#b20'
  amount = 100

  updateSensors() {
    const { amount, sensors } = this

    if (amount > 900) sensors.illness += 5
    else if (amount > 800) sensors.illness += 4
    else if (amount > 700) sensors.illness += 3
    else if (amount > 600) sensors.illness += 2
    else if (amount > 500) sensors.illness += 1
  }

  updateActuators() {}

  metabolize() {
    super.metabolize(0.0005)
  }

  isUnconscious() {
    return false
  }

  isDead() {
    return this.amount > 1000
  }
}
