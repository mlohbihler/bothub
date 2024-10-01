import { Vec2 } from 'planck'

const defaultSensorPrecision = 2

export const blur = (n: number, sensorPrecision = defaultSensorPrecision) => Number(n.toPrecision(sensorPrecision))

export const blurVector = (v: Vec2, sensorPrecision = defaultSensorPrecision) => {
  v.x = Number(v.x.toPrecision(sensorPrecision))
  v.y = Number(v.y.toPrecision(sensorPrecision))
  return v
}

// Rounds numbers to the nearest 0.05
export const blurAngle = (a: number) => Number((a * 2).toFixed(1)) / 2
