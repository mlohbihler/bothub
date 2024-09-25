import { shorten } from './util'

export default {
  shorten,
  formatTime,
}

function formatTime(time: number) {
  const ms = Math.round((time % 1) * 1000).toString()
  const sec = (Math.floor(time) % 60).toString()
  const min = (Math.floor(time / 60) % 60).toString()
  return `${min}:${sec.padStart(2, '0')}.${ms.padStart(3, '0')}`
}
