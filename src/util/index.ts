import { Math } from 'planck'

export const agentColor = '#08f'

export const getRequiredElementById = (id: string) => {
  const ele = document.getElementById(id)
  if (!ele) {
    throw Error(`Required element with id '${id}' not found`)
  }
  return ele
}

export const createElement = (
  parent: HTMLElement,
  html: string,
  attributes: { [key: string]: string } = {},
): HTMLElement => {
  parent.insertAdjacentHTML('beforeend', html)
  const ele = parent.lastChild as HTMLElement
  Object.keys(attributes).forEach(k => ele.setAttribute(k, attributes[k]))
  return ele
}

export const expectedY = (x1: number, y1: number, x2: number, y2: number, x3: number) => {
  // The case of x1 == x2 is not handled
  const m = (y2 - y1) / (x2 - x1)
  const b = y1 - m * x1
  return m * x3 + b
}

export class DebugHelper {
  cx

  constructor(cx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    this.cx = cx
  }

  dot(x: number, y: number, r: number, style: string) {
    const { cx } = this

    cx.fillStyle = style

    cx.beginPath()
    cx.ellipse(x, y, r, r, 0, 0, Math.PI * 2)
    cx.fill()
  }

  circle(x: number, y: number, r: number, style: string, width = 1) {
    const { cx } = this

    cx.lineWidth = width
    cx.strokeStyle = style

    cx.beginPath()
    cx.ellipse(x, y, r, r, 0, 0, Math.PI * 2)
    cx.stroke()
  }

  line(sx: number, sy: number, ex: number, ey: number, style: string, width = 3) {
    const { cx } = this

    cx.lineWidth = width
    cx.lineCap = 'butt'
    cx.strokeStyle = style

    cx.beginPath()
    cx.moveTo(sx, sy)
    cx.lineTo(ex, ey)
    cx.stroke()
  }

  rect(x1: number, y1: number, x2: number, y2: number, style: string, width = 3) {
    const { cx } = this

    cx.lineWidth = width
    cx.lineCap = 'butt'
    cx.strokeStyle = style

    cx.beginPath()
    cx.moveTo(x1, y1)
    cx.lineTo(x1, y2)
    cx.lineTo(x2, y2)
    cx.lineTo(x2, y1)
    cx.closePath()
    cx.stroke()
  }

  getContext() {
    return this.cx
  }
}

export const shorten = (n: number) => {
  if (n < 0.0001 && n > -0.0001) {
    return 0
  }
  return n.toPrecision(4)
}

// See: https://developer.classpath.org/doc/java/util/Random-source.html
let haveNextGaussian = false
let nextGaussian: number
export const gaussian = () => {
  if (haveNextGaussian) {
    haveNextGaussian = false
    return nextGaussian
  }
  let v1: number = 0
  let v2: number = 0
  let s = 1
  while (s >= 1) {
    v1 = 2 * Math.random() - 1 // Between -1.0 and 1.0.
    v2 = 2 * Math.random() - 1 // Between -1.0 and 1.0.
    s = v1 * v1 + v2 * v2
  }
  const norm = Math.sqrt((-2 * Math.log(s)) / s)
  nextGaussian = v2 * norm
  haveNextGaussian = true
  return v1 * norm
}

// Returns an angle value between -Math.PI and Math.PI
export const minimizeAngle = (a: number) => {
  a = a % (Math.PI * 2)
  if (a > Math.PI) {
    a -= Math.PI * 2
  } else if (a < -Math.PI) {
    a += Math.PI * 2
  }
  return a
}

export const isNumber = (v: any) => {
  return typeof v === 'number'
}

// Returns true if the argument is null or undefined
export const isNil = (v: any) => {
  return v == null
}

export const distanceSquared = (x1: number, y1: number, x2: number, y2: number) => {
  return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)
}

export const mean = <T>(arr: T[], fn?: (e: T) => number) => {
  let sum = 0
  for (let i = 0; i < arr.length; i++) {
    sum += fn ? fn(arr[i]) : (arr[i] as number)
  }
  return sum / arr.length
}

export const min = <T>(arr: T[], fn?: (e: T) => number) => minOrMax(arr, true, fn)
export const max = <T>(arr: T[], fn?: (e: T) => number) => minOrMax(arr, false, fn)
const minOrMax = <T>(arr: T[], min: boolean, fn?: (e: T) => number): T | undefined => {
  let boundValue = Infinity * (min ? 1 : -1)
  return arr.reduce((prev, curr) => {
    const value = fn ? fn(curr) : (curr as number)
    const newBound = min ? value < boundValue : value > boundValue
    if (newBound) {
      boundValue = value
      return curr
    }
    return prev
  }, undefined as T)
}

export const near = (value: number, target: number, tolerance: number) => Math.abs(target - value) <= tolerance
export const nearExclusive = (value: number, target: number, tolerance: number) =>
  value >= target - tolerance && value < target + tolerance

export const getContext = (
  canvas: HTMLCanvasElement | OffscreenCanvas,
): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D => {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Unable to create context')
  return ctx
}

export const repeat = (value: number, times: number) => new Array(times).fill(value)

export const linspace = (from: number, to: number, count: number) => {
  if (count === 0) return []
  if (count === 1) return [from]

  const step = (to - from) / (count - 1)
  const result = Array(count)
    .fill(0)
    .map((_, i) => from + step * i)
  return result
}

export const cartesianProduct = (arrays: any[][]) => {
  return arrays.reduce((acc, curr) => {
    return acc.flatMap(d => curr.map(e => [d, e].flat()))
  })
}

export const clamp = (num: number, min: number, max: number): number => {
  if (num < min) {
    return min
  } else if (num > max) {
    return max
  } else {
    return num
  }
}

export const minmax = (arr: number[]) =>
  arr.reduce(
    (minmax, current) => {
      if (minmax[0] > current) minmax[0] = current
      if (minmax[1] < current) minmax[1] = current
      return minmax
    },
    [Infinity, -Infinity] as [number, number],
  )
