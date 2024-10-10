import { Vec2 } from 'planck'
import { agentColor, clamp } from '../util'
import { vectorAngle } from '../planck/boxUtil'
import Rectangle from '../planck/rectangle'

// @ts-ignore
import Chevron from '../assets/svg/fa-chevron-up.svg?raw'

const defaultSensorPrecision = 2

export const blur = (n: number, sensorPrecision = defaultSensorPrecision) => Number(n.toPrecision(sensorPrecision))

export const blurVector = (v: Vec2, sensorPrecision = defaultSensorPrecision) => {
  v.x = Number(v.x.toPrecision(sensorPrecision))
  v.y = Number(v.y.toPrecision(sensorPrecision))
  return v
}

// Rounds numbers to the nearest 0.05
export const blurAngle = (a: number) => Number((a * 2).toFixed(1)) / 2

const svg = new DOMParser().parseFromString(Chevron, 'image/svg+xml')
const viewBox = (svg.getElementsByTagName('svg')[0].getAttribute('viewBox') || '').split(' ').map(i => parseInt(i))
const chevronScale = Vec2(0.1, 0.1)
const chevronHalfSize = Vec2(viewBox[2] / 2, viewBox[3] / 2)
const chevronPath = new Path2D(svg.getElementsByTagName('path')[0].getAttribute('d') || '')
const padding = Vec2(chevronHalfSize.x * chevronScale.x, chevronHalfSize.y * chevronScale.y)

export const drawOffscreenDirection = (cx: CanvasRenderingContext2D, target: Vec2, viewport: Rectangle) => {
  if (!viewport.contains(target)) {
    const chevronPosition = target.clone()

    chevronPosition.x = clamp(chevronPosition.x, viewport.x + padding.x, viewport.x + viewport.w - padding.x)
    chevronPosition.y = clamp(chevronPosition.y, viewport.y + padding.y, viewport.y + viewport.h - padding.y)

    const angle = vectorAngle(Vec2.sub(target, chevronPosition))

    cx.translate(chevronPosition.x, chevronPosition.y)
    cx.scale(chevronScale.x, chevronScale.y)
    cx.rotate(angle + Math.PI / 2)
    cx.translate(-chevronHalfSize.x, -chevronHalfSize.y)
    cx.lineWidth = 5
    cx.strokeStyle = agentColor
    cx.stroke(chevronPath)
  }
}
