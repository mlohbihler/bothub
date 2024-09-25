import { Body, ContactEdge, Fixture, Joint, Transform, Vec2 } from 'planck'
import { isNil } from '../util'

export const FPS = 60

export const rotate = (vector: Vec2, angle: number, mutate = false) => {
  return rotateAbout(vector, angle, Vec2.zero(), mutate)
}

export const rotateAbout = (vector: Vec2, angle: number, point: Vec2, mutate = false) => {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const out = mutate ? vector : Vec2()
  const x = point.x + ((vector.x - point.x) * cos - (vector.y - point.y) * sin)
  out.y = point.y + ((vector.x - point.x) * sin + (vector.y - point.y) * cos)
  out.x = x
  return out
}

export const vectorAngle = (v: Vec2) => {
  return Math.atan2(v.y, v.x)
}

export const polarToCart = (mag: number, angle: number) => {
  return rotate(Vec2(mag, 0), angle, true)
}

export const regularPolygonVertices = (sides: number, radius: number) => {
  return new Array(sides).fill(0).map((_e, i) => polarToCart(radius, ((Math.PI * 2) / sides) * i))
}

type Nextable = Body | Fixture | Joint

export const forEachNextable = <T extends Nextable>(nextable: T | null, fn: (nextable: T, index: number) => void) => {
  let index = 0
  while (nextable) {
    fn(nextable, index)
    index++
    nextable = nextable.getNext() as T
  }
}

export const filterNextables = <T extends Nextable>(
  nextable: T | null,
  fn: (nextable: T, index: number) => boolean,
) => {
  const result: T[] = []
  forEachNextable(nextable, (n, i) => {
    if (fn(n, i)) result.push(n)
  })
  return result
}

export const findNextable = <T extends Nextable>(nextable: T | null, fn: (nextable: T, index: number) => T | null) => {
  let index = 0
  while (nextable) {
    if (fn(nextable, index)) return nextable
    index++
    nextable = nextable.getNext() as T
  }
  return null
}

export const testPoint = (bodies: Body[], p: Vec2): boolean => {
  return !isNil(bodies.find(b => findNextable(b.getFixtureList(), f => (f.testPoint(p) ? f : null))))
}

export const forEachContactEdge = (
  contactEdge: ContactEdge | null,
  fn: (contactEdge: ContactEdge, index: number) => void,
) => {
  let index = 0
  while (contactEdge) {
    fn(contactEdge, index)
    index++
    contactEdge = contactEdge.next
  }
}

export const eachEdge = (vertices: Vec2[], xf: Transform, cb: (from: Vec2, to: Vec2) => void) => {
  let from: Vec2
  let to: Vec2
  vertices = Transform.mulAll(xf, vertices)
  for (let i = 0; i < vertices.length; i++) {
    from = vertices[i]
    to = vertices[(i + 1) % vertices.length]
    cb(from, to)
  }
}
