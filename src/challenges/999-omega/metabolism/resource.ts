import Actuators from '../actuators'
import Sensors from '../sensors'

export default class Resource {
  colour = '#fff'
  // Amount available for consumption
  amount = 1000
  // Amount available for digestion
  ingested = 0
  ingestionRate = 0.1

  sensors
  actuators

  constructor(sensors: Sensors, actuators: Actuators) {
    this.sensors = sensors
    this.actuators = actuators
  }

  updateSensors() {
    throw new Error('not implemented')
  }

  updateActuators() {
    throw new Error('not implemented')
  }

  metabolize(metabolizedAmount: number) {
    const rate = this.getIngestionRate()
    const ingestion = rate < this.ingested ? rate : this.ingested
    this.amount += ingestion
    this.ingested -= ingestion
    this.amount -= metabolizedAmount < this.amount ? metabolizedAmount : this.amount
  }

  isUnconscious() {
    throw new Error('not implemented')
  }

  isDead() {
    throw new Error('not implemented')
  }

  ingest(amount: number) {
    this.ingested += amount
  }

  getIngestionRate() {
    return this.ingestionRate
  }
}
