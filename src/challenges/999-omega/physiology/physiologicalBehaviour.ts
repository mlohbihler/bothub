import { StepEvent } from '../../@types'
import Actuators from '../actuators'
import Behaviour from '../behaviour'
import Resources from '../metabolism/resources'
import Sensors from '../sensors'

// Different from controller behaviors in that they have access to resources, and can influence the
// environment.
export default class PhysiologicalBehaviour extends Behaviour {
  resources

  constructor(sensors: Sensors, actuators: Actuators, resources: Resources) {
    super(sensors, actuators)
    this.resources = resources
  }

  updateSensors(_evt: StepEvent) {}

  ingest(resourceAmounts?: Map<string, number>) {
    resourceAmounts?.forEach((amt, type) => this.resources.ingest(type, amt))
  }
}
