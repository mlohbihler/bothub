import { StepEvent } from '../../../@types'
import { FPS } from '../../../planck/boxUtil'
import Actuators from '../actuators'
import Edibles from '../environment/edibles/edibles'
import Resources from '../metabolism/resources'
import Sensors from '../sensors'
import PhysiologicalBehaviour from './physiologicalBehaviour'

export default class Drink extends PhysiologicalBehaviour {
  static resourceAmounts = Edibles.resourceAmountsForType('Water')
  static duration = FPS * 3

  deadline: number
  resourceAmounts?: Map<string, number>

  constructor(
    sensors: Sensors,
    actuators: Actuators,
    evt: StepEvent,
    resources: Resources,
    edibleType: string | undefined,
    removeBodyFn: () => void,
  ) {
    super(sensors, actuators, resources)

    this.deadline = evt.step + Drink.duration
    if (edibleType === 'Water') {
      this.resourceAmounts = Drink.resourceAmounts
      removeBodyFn()
    }
  }

  updateSensors(evt: StepEvent) {
    if (!this.done(evt)) this.sensors.drinking = true
  }

  step(evt: StepEvent) {
    super.step(evt)
    this.actuators.clear()
    this.ingest(this.resourceAmounts)
  }

  done(evt: StepEvent) {
    return evt.step >= (this.deadline || 0)
  }
}
