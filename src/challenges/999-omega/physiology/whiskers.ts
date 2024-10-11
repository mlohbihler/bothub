import { checkIntersection, Point } from 'line-intersect'
import { CircleShape, EdgeShape, Fixture, PolygonShape, Transform, Vec2 } from 'planck'
import { ShapeInfo, Intersection } from 'kld-intersections'
import { WhiskerDefs, WhiskerId } from '../physiology'
import { eachEdge, rotate } from '../../../planck/boxUtil'
import { min } from '../../../util'

interface NearestPoint extends Point {
  distance: number
}

export interface WhiskerInfo {
  id: WhiskerId
  depth: number
  ratio?: number
  protrusion: number
  length: number
  angle: number
}
export default class Whiskers {
  depths: { [key in WhiskerId]?: number } = {}
  count = 0

  constructor() {
    this.clear()
  }

  clear() {
    this.depths = {}
    this.count = 0
  }

  any() {
    return this.count > 0
  }

  has(id: WhiskerId) {
    return id in this.depths
  }

  anyLeft() {
    return this.has('tl') || this.has('l') || this.has('hl')
  }

  anyRight() {
    return this.has('tr') || this.has('r') || this.has('hr')
  }

  // Returns true if the given ids are the only whiskers active. Ids are expected to not have duplicates.
  hasOnly(ids: WhiskerId[] | WhiskerId) {
    if (ids.constructor === Array) {
      const everyId = ids.every(id => this.has(id))
      return everyId && this.count === ids.length
    }
    return this.count === 1 && this.has(ids as WhiskerId)
  }

  // Find the first whisker from the ids given in the given order, or null if not found.
  // type TestParams = Parameters<(a: string, b: number) => void> // [string, number]

  find(ids: WhiskerId[]) {
    for (let i = 0; i < ids.length; i++) {
      if (this.has(ids[i])) {
        return this.getInfo(ids[i])
      }
    }
  }

  hasAny() {
    for (let i = 0; i < arguments.length; i++) {
      if (this.has(arguments[i])) {
        return true
      }
    }
    return false
  }

  add(id: WhiskerId, depth: number) {
    if (!this.has(id) || this.getDepth(id) < depth) {
      if (!this.has(id)) {
        this.count++
      }
      this.depths[id] = depth
      return true
    }
    return false
  }

  ids() {
    return Object.keys(this.depths) as WhiskerId[]
  }

  getDepth(id: WhiskerId) {
    return this.maybeGetDepth(id) as number
  }
  maybeGetDepth(id: WhiskerId) {
    return this.depths[id]
  }

  getRatio(id: WhiskerId) {
    return this.maybeGetRatio(id) as number
  }
  maybeGetRatio(id: WhiskerId) {
    if (this.has(id)) {
      return this.getDepth(id) / this.getProtrusion(id)
    }
  }

  // The length the whisker protrudes from the agent body.
  getProtrusion(id: WhiskerId) {
    return WhiskerDefs.getProtrusion(id)
  }

  // The length of the whisker from the center of the agent body.
  getLength(id: WhiskerId) {
    return WhiskerDefs.getLength(id)
  }

  // The angle from the nose that the whisker protrudes.
  getAngle(id: WhiskerId) {
    return WhiskerDefs.getAngle(id)
  }

  // Probably a better name for this.
  getInfo(id: WhiskerId): WhiskerInfo {
    return this.maybeGetInfo(id) as WhiskerInfo
  }
  maybeGetInfo(id: WhiskerId): WhiskerInfo | undefined {
    if (this.has(id)) {
      return {
        id,
        depth: this.getDepth(id),
        ratio: this.getRatio(id),
        protrusion: this.getProtrusion(id),
        length: this.getLength(id),
        angle: this.getAngle(id),
      }
    }
  }

  // Returns the whisker contact point in the agent FOR or null if there is not contact.
  getContactPoint(id: WhiskerId) {
    return this.maybeGetContactPoint(id) as Vec2
  }
  maybeGetContactPoint(id: WhiskerId) {
    if (this.has(id)) {
      return rotate(Vec2(this.getLength(id) - this.getDepth(id), 0), this.getAngle(id))
    }
  }

  nearestIntersectionPoint(whiskerFixture: Fixture, otherFixture: Fixture, origin: Vec2) {
    if (whiskerFixture.getShape().getType() !== 'polygon') throw Error('Whisker shape must be a polygon')

    const xf = whiskerFixture.getBody().getTransform()
    const whiskerVertices = Transform.mulAll(xf, (whiskerFixture.getShape() as PolygonShape).m_vertices)
    const points: NearestPoint[] = []

    const otherShape = otherFixture.getShape()
    const otherShapeType = otherShape.getType()
    if (otherShapeType === 'circle') {
      const pos = whiskerFixture.getBody().getPosition()
      const otherPos = otherFixture.getBody().getPosition()
      const otherRadius = (otherFixture.getShape() as CircleShape).getRadius()

      const line = ShapeInfo.line(
        [whiskerVertices[0].x, whiskerVertices[0].y],
        [whiskerVertices[2].x, whiskerVertices[2].y],
      )
      const circle = ShapeInfo.circle([otherPos.x, otherPos.y], otherRadius)
      // TODO: these are now Vec2s, but have the same structure. Still, should probably define
      // proper types for this package.
      const intersections = Intersection.intersect(circle, line).points as Vec2[]
      intersections.forEach(({ x, y }) => {
        const p = { x, y } as NearestPoint
        p.distance = Vec2.sub(p, pos).lengthSquared()
        points.push(p)
      })
    } else if (otherShapeType === 'polygon' || otherShapeType === 'edge') {
      const whiskerVertices = Transform.mulAll(xf, (whiskerFixture.getShape() as PolygonShape).m_vertices)
      let otherVertices
      if (otherShapeType === 'polygon') {
        otherVertices = (otherShape as PolygonShape).m_vertices
      } else {
        const edge = otherShape as EdgeShape
        otherVertices = [edge.m_vertex1, edge.m_vertex2]
      }
      eachEdge(otherVertices, otherFixture.getBody().getTransform(), (from, to) => {
        const result = checkIntersection(
          whiskerVertices[0].x,
          whiskerVertices[0].y,
          whiskerVertices[2].x,
          whiskerVertices[2].y,
          from.x,
          from.y,
          to.x,
          to.y,
        )
        if (result.type === 'intersecting') {
          const point = result.point as NearestPoint
          point.distance = Vec2.sub(point, origin).lengthSquared()
          points.push(point)
        }
      })
    } else {
      throw Error(`Unhandled shape: '${otherShapeType}'`)
    }

    const nearest = min(points, p => p.distance)
    if (nearest) nearest.distance = Math.sqrt(nearest.distance)
    return nearest
  }
}
