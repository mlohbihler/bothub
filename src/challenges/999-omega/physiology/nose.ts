import { Body } from 'planck'
import Sensors from '../sensors'
import { FPS } from '../../../planck/boxUtil'
import { PerceptibleBody, StepEvent } from '../../../@types'

export default class Nose {
  static textureDuration = FPS * 0.5 // Half a second
  static scentDuration = FPS * 3 // 3 seconds.

  sensors

  constructor(sensors: Sensors) {
    this.sensors = sensors
  }

  previousContactBody: Body | null = null
  textureDeadline: number = -1
  scentDeadline: number = -1

  step(evt: StepEvent, contactBody: Body | null) {
    const { textureDuration, scentDuration } = Nose

    if (contactBody) {
      const pbody = contactBody as PerceptibleBody
      if (contactBody !== this.previousContactBody) {
        this.textureDeadline = evt.step + textureDuration
        this.scentDeadline = evt.step + scentDuration
      }

      if (this.textureDeadline <= evt.step) this.sensors.noseTexture = pbody.texture
      if (this.scentDeadline <= evt.step) this.sensors.noseScent = pbody.scent
    } else {
      this.textureDeadline = -1
      this.scentDeadline = -1
    }

    this.previousContactBody = contactBody
  }
}
