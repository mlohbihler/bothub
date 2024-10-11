import { IActuators } from '../../@types'
import { clamp } from '../../util'

export const maxTurn = Math.PI / 12 // 30 degrees
export const minSpeed = -0.5
export const maxSpeed = 2
export const maxSidle = 0.4

export default class Actuators implements IActuators {
  speed = 0
  turn = 0
  sidle = 0

  clampTurn(ratio: number) {
    if (ratio >= 0 && ratio <= 1) {
      this.turn = clamp(this.turn, -maxTurn * ratio, maxTurn * ratio)
    }
  }

  clampSpeed(ratio: number) {
    if (ratio >= 0 && ratio <= 1) {
      this.speed = clamp(this.speed, minSpeed * ratio, maxSpeed * ratio)
    }
  }

  clampSidle(ratio: number) {
    if (ratio >= 0 && ratio <= 1) {
      this.sidle = clamp(this.sidle, -maxSidle * ratio, maxSidle * ratio)
    }
  }

  clear() {
    this.speed = 0
    this.turn = 0
    this.sidle = 0
  }
}
