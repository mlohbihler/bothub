import Resource from './resource'

export default class Minerium extends Resource {
  colour = '#d10'

  updateSensors() {
    const { amount, sensors } = this

    if (amount < 100) sensors.illness += 5
    else if (amount < 200) sensors.illness += 4
    else if (amount < 300) sensors.illness += 3
    else if (amount < 400) sensors.illness += 2
    else if (amount < 500) sensors.illness += 1

    if (amount > 1900) sensors.illness += 5
    else if (amount > 1800) sensors.illness += 4
    else if (amount > 1700) sensors.illness += 3
    else if (amount > 1600) sensors.illness += 2
    else if (amount > 1500) sensors.illness += 1
  }

  updateActuators() {}

  metabolize() {
    super.metabolize(0.00012)
  }

  isUnconscious() {
    return false
  }

  isDead() {
    return this.amount <= 0 || this.amount > 2000
  }
}
