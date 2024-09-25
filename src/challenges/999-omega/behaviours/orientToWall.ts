import ProcedureQueue from '../tools/procedureQueue'
import Behaviour from '../behaviour'
import CircleAroundPoint from './circleAroundPoint'
import MoveTowardPoint from './moveTowardPoint'
import { WhiskerDefs, WhiskerId } from '../physiology'
import Sensors from '../sensors'
import Actuators from '../actuators'
import { StepEvent } from '../../@types'
import { max, mean, min } from '../../util'

// Orienting to a wall means to have the side and head side whiskers touching it.
export default class OrientToWall extends Behaviour {
  headSideWhiskerId: WhiskerId
  sideWhiskerId: WhiskerId
  targetOrdinal
  queue?: ProcedureQueue

  constructor(sensors: Sensors, actuators: Actuators, side: 'l' | 'r') {
    super(sensors, actuators)
    this.headSideWhiskerId = `h${side}`
    this.sideWhiskerId = side
    this.targetOrdinal = WhiskerDefs.getOrdinal(this.sideWhiskerId)
  }

  initialize(_evt: StepEvent) {
    const { sensors, actuators, targetOrdinal } = this
    const { whiskers } = sensors

    // Determine the direction in which we need to turn.
    // Find the average of the current ordinals.
    const ids = whiskers.ids()
    const currentOrdinal = mean(ids, id => WhiskerDefs.getOrdinal(id))

    let startId
    if (currentOrdinal > targetOrdinal) {
      // Find the current whisker with the lowest ordinal
      startId = min(ids, id => WhiskerDefs.getOrdinal(id)) as WhiskerId
    } else {
      // Find the current whisker with the highest ordinal
      startId = max(ids, id => WhiskerDefs.getOrdinal(id)) as WhiskerId
    }

    this.queue = new ProcedureQueue([
      new Initializer(sensors, actuators, startId),
      new Rotator(sensors, actuators, targetOrdinal, startId),
    ])
  }

  step(evt: StepEvent) {
    super.step(evt)
    this.queue?.step(evt)
  }

  done(_evt: StepEvent) {
    const {
      sideWhiskerId,
      sensors: { whiskers },
    } = this
    return whiskers.has(sideWhiskerId) && (whiskers.getRatio(sideWhiskerId) || 0) > 0.3
  }
}

class Initializer extends Behaviour {
  id
  behaviour?: Behaviour

  constructor(sensors: Sensors, actuators: Actuators, id: WhiskerId) {
    super(sensors, actuators)
    this.id = id
  }

  initialize(_evt: StepEvent) {
    this.behaviour = new MoveTowardPoint(this.sensors, this.actuators, this.sensors.whiskers.getContactPoint(this.id))
  }

  step(evt: StepEvent) {
    super.step(evt)
    this.behaviour?.step(evt)
  }

  done(_evt: StepEvent) {
    return this.sensors.whiskers.getRatio(this.id) > 0.3
  }
}

class Rotator extends Behaviour {
  targetOrdinal
  currentId
  nextId
  behaviour?: Behaviour

  constructor(sensors: Sensors, actuators: Actuators, targetOrdinal: number, startId: WhiskerId) {
    super(sensors, actuators)
    this.targetOrdinal = targetOrdinal
    this.currentId = startId

    const startOrdinal = WhiskerDefs.getOrdinal(startId)
    const nextOrdinal = startOrdinal + Math.sign(targetOrdinal - startOrdinal)
    this.nextId = WhiskerDefs.getIdForOrdinal(nextOrdinal)
  }

  step(evt: StepEvent) {
    super.step(evt)

    const { sensors, actuators, targetOrdinal } = this
    const { whiskers } = sensors

    if (whiskers.has(this.nextId)) {
      if (whiskers.getRatio(this.nextId) > 0.3) {
        const currentOrdinal = WhiskerDefs.getOrdinal(this.currentId)
        this.currentId = this.nextId
        const nextOrdinal = currentOrdinal + Math.sign(targetOrdinal - currentOrdinal)
        this.nextId = WhiskerDefs.getIdForOrdinal(nextOrdinal)
        this.behaviour = undefined
      }
    }

    if (!this.behaviour) {
      this.behaviour = new CircleAroundPoint(sensors, actuators, whiskers.getContactPoint(this.currentId))
    }
    this.behaviour.step(evt)
  }
}
