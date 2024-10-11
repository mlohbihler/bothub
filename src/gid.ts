import { Vec2 } from 'planck'
import { isNil, minimizeAngle, shorten } from './util'
import { FPS, polarToCart, rotate, vectorAngle } from './planck/boxUtil'
import { PathIntegrator } from './challenges/challengeUtil'

export default {
  formatTime,
  FPS,
  isNil,
  minimizeAngle,
  PathIntegrator,
  polarToCart,
  rotate,
  shorten,
  Vec2,
  vectorAngle,
}

function formatTime(time: number) {
  const ms = Math.round((time % 1) * 1000).toString()
  const sec = (Math.floor(time) % 60).toString()
  const min = (Math.floor(time / 60) % 60).toString()
  return `${min}:${sec.padStart(2, '0')}.${ms.padStart(3, '0')}`
}
