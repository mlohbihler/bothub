import { StepEvent } from '../../@types'
import { polarToCart } from '../../boxUtil'
import { expectedY } from '../../util'
import Behaviour from '../behaviour'
import { WhiskerId } from '../physiology'
import Whiskers, { WhiskerInfo } from '../physiology/whiskers'

export default class FollowWall extends Behaviour {
  step(evt: StepEvent) {
    super.step(evt)
    const { sensors, actuators, getInfo, getRatio } = this
    const { whiskers } = sensors

    let cornerDetected = null

    // Detect if the 3 contact points don't line up. Only really useful for detecting concave
    // corners since on convex we will lose the head-side contact.
    if (whiskers.has('hr') && whiskers.has('r') && whiskers.has('tr')) {
      const diff = contactLineDiff(getInfo(whiskers, 'hr'), getInfo(whiskers, 'r'), getInfo(whiskers, 'tr'))
      if (diff > 1) {
        cornerDetected = 'concave'
      }
    } else if (whiskers.has('hl') && whiskers.has('l') && whiskers.has('tl')) {
      const diff = contactLineDiff(getInfo(whiskers, 'hl'), getInfo(whiskers, 'l'), getInfo(whiskers, 'tl'))
      if (diff > 1) {
        cornerDetected = 'concave'
      }
    }

    // We want all three side whiskers to be in contact with the wall so that we can detect corners
    // (because the three contacts are no longer in a straight enough line).
    if (whiskers.has('hr')) {
      actuators.turn = (0.35 - getRatio(whiskers, 'hr')) / 2
    } else if (whiskers.has('hl')) {
      actuators.turn = (0.35 - getRatio(whiskers, 'hl')) / -2
    }

    if (whiskers.has('tr')) {
      actuators.turn += (0.55 - getRatio(whiskers, 'tr')) / -2
    } else if (whiskers.has('tl')) {
      actuators.turn += (0.55 - getRatio(whiskers, 'tl')) / 2
    }

    if (whiskers.has('r')) {
      actuators.sidle = 0.8 - getRatio(whiskers, 'r')
      if (!whiskers.has('hr')) {
        cornerDetected = 'convex'
      }
    } else if (whiskers.has('l')) {
      actuators.sidle = getRatio(whiskers, 'l') - 0.8
      if (!whiskers.has('hl')) {
        cornerDetected = 'convex'
      }
    }

    actuators.speed = 2

    if (cornerDetected) {
      sensors.events.cornerDetected = cornerDetected
    }
  }

  getInfo(whiskers: Whiskers, id: WhiskerId) {
    return whiskers.getInfo(id) as WhiskerInfo
  }

  getRatio(whiskers: Whiskers, id: WhiskerId) {
    return whiskers.getRatio(id) as number
  }
}

// Returns the expected y value for the third point assuming that all 3 points are in a line. This
// can be compared with the actual y value to determine if the wall has an unexpected shape.
const contactLineDiff = (h: WhiskerInfo, s: WhiskerInfo, t: WhiskerInfo) => {
  const ph = polarToCart(h.length - h.depth, h.angle)
  const ps = polarToCart(s.length - s.depth, s.angle)
  const pt = polarToCart(t.length - t.depth, t.angle)
  const pty = expectedY(ph.x, ph.y, ps.x, ps.y, pt.x)
  return Math.abs(pty - pt.y)
}
