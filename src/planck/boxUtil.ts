import { AABB, Body, ContactEdge, EdgeShape, Fixture, Joint, PolygonShape, Transform, Vec2 } from 'planck'
import { isNil, min, minimizeAngle } from '../util'
import { checkIntersection } from 'line-intersect'

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

interface NearestPoint extends Vec2 {
  type?: 'intersection' | 'vertex'
  distanceSq?: number
}
const edgeAABB = AABB()
export const fixtureIntersectionPoints = (agentFixture: Fixture, otherFixture: Fixture, agentRadius: number) => {
  if (agentFixture.getShape().getType() !== 'circle') throw Error('Agent shape must be a circle')

  const contactRadius = agentRadius * 1.01
  const radiusSq = agentRadius * agentRadius

  const contactAngles = []
  const pos = agentFixture.getBody().getPosition()
  const angle = agentFixture.getBody().getAngle()
  const otherShape = otherFixture.getShape()
  const otherShapeType = otherShape.getType()
  if (otherShapeType === 'circle') {
    const otherPos = otherFixture.getBody().getPosition()
    const diffVec = Vec2.sub(otherPos, pos)
    contactAngles.push(minimizeAngle(vectorAngle(diffVec) - angle))
  } else if (otherShapeType === 'polygon' || otherShapeType === 'edge') {
    const agentAABB = AABB(
      Vec2(pos.x - contactRadius, pos.y - contactRadius),
      Vec2(pos.x + contactRadius, pos.y + contactRadius),
    )
    let otherVertices
    if (otherShapeType === 'polygon') {
      otherVertices = (otherShape as PolygonShape).m_vertices
    } else {
      const edge = otherShape as EdgeShape
      otherVertices = [edge.m_vertex1, edge.m_vertex2]
    }
    const points: NearestPoint[] = []
    let foundIntersection = false

    otherFixture.getBody().getTransform()

    eachEdge(otherVertices, otherFixture.getBody().getTransform(), (from, to) => {
      // Ensure that there are bounds overlap first
      AABB.combinePoints(edgeAABB, from, to)
      if (!AABB.testOverlap(agentAABB, edgeAABB)) return

      // Find a line that bisects the agent body that is perpendicular to this edge.
      const perp = Vec2(to.y - from.y, from.x - to.x)
      const factor = contactRadius / perp.length()
      perp.mul(factor)
      const result = checkIntersection(
        from.x,
        from.y,
        to.x,
        to.y,
        pos.x + perp.x,
        pos.y + perp.y,
        pos.x - perp.x,
        pos.y - perp.y,
      )
      let nearest: NearestPoint | null = null
      if (result.type === 'intersecting') {
        nearest = Vec2.sub(result.point, pos)
        nearest.type = 'intersection'
        foundIntersection = true
      } else if (result.type === 'none' && !foundIntersection) {
        // The segments may not intersect, but the edge could still penetrate the agent body. Find if
        // either end point is within the agent radius.
        const fromVec = Vec2.sub(from, pos)
        const fromSq = fromVec.lengthSquared()
        const toVec = Vec2.sub(to, pos)
        const toSq = toVec.lengthSquared()
        if (fromSq < toSq) {
          nearest = fromVec
          nearest.distanceSq = fromSq
        } else {
          nearest = toVec
          nearest.distanceSq = toSq
        }
        if (nearest.distanceSq <= radiusSq) {
          nearest.type = 'vertex'
        } else {
          nearest = null
        }
      }
      if (nearest) {
        points.push(nearest)
      }
    })

    // There are two types of intersection found: one with an intersection point, and one where we
    // choose the closest point of a non-intersecting segment. If we have any of the former, we
    // discard the latter. If we only have the latter, we return only one instance of the closest
    // point. The goal is to retain legitimate cases of multiple contact points and discard
    // duplicates.
    if (foundIntersection) {
      // Return angles for all intersection points.
      points.forEach(p => {
        if (p.type === 'vertex') return
        contactAngles.push(minimizeAngle(vectorAngle(p) - angle))
      })
    } else if (points.length) {
      // Return only the angle of the minimum distance point.
      const nearest = min(points, p => p.distanceSq || Infinity) as Vec2
      contactAngles.push(minimizeAngle(vectorAngle(nearest) - angle))
    }
  } else {
    throw Error(`Unhandled shape: '${otherShapeType}'`)
  }

  return contactAngles
}
