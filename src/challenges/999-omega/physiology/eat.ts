import { StepEvent } from '../../@types'
import { FPS } from '../../boxUtil'
import Actuators from '../actuators'
import Edibles from '../environment/edibles/edibles'
import Resources from '../metabolism/resources'
import Sensors from '../sensors'
import PhysiologicalBehaviour from './physiologicalBehaviour'

export default class Eat extends PhysiologicalBehaviour {
  static duration = FPS * 5

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

    this.deadline = evt.step + Eat.duration
    if (edibleType?.endsWith(Edibles.foodSuffix)) {
      this.resourceAmounts = Edibles.resourceAmountsForType(edibleType)
      removeBodyFn()
    }
  }

  updateSensors(evt: StepEvent) {
    if (!this.done(evt)) this.sensors.eating = true
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
