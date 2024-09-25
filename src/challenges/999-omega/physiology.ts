import { AABB, Body, Circle, EdgeShape, Fixture, FixtureDef, Polygon, PolygonShape, Vec2, World } from 'planck'
import { eachEdge, forEachContactEdge, rotate, vectorAngle } from '../../planck/boxUtil'
import { StepEvent } from '../../@types'
import Sensors from './sensors'
import Actuators from './actuators'
import Nose from './physiology/nose'
import Resources from './metabolism/resources'
import Controller from './controller'
import PhysiologicalBehaviour from './physiology/physiologicalBehaviour'
import Texture from './environment/attributes/texture'
import Scent from './environment/attributes/scent'
import Drink from './physiology/drink'
import Eat from './physiology/eat'
import { min, minimizeAngle } from '../../util'
import { checkIntersection } from 'line-intersect'
import Ambience from './environment/attributes/ambience'
import { EdibleBody } from './environment/edibles/edible'
import { shorten } from '../../util'

const offsetX = 400
const offsetY = 1000
const angle = 0 // 1
export const radius = 10
const radiusSq = radius * radius
const sensorPrecision = 10 // 2
const agentBodyId = 'agentBody'

// Whiskers originate at the center of the agent body because otherwise they can end up entirely
// inside the opposite body of a collision. (They still might, depending on the speed of the
// collision.) It also happens it makes the math easier when creating the whisker.
export type WhiskerId = 'tl' | 'l' | 'hl' | 'h' | 'hr' | 'r' | 'tr'
interface WhiskerDef {
  ordinal: number
  length: number
  angle: number
  protrusion: number
}
export class WhiskerDefs {
  static width = 0.1

  static defs: { [key in WhiskerId]: WhiskerDef } = {
    tl: { ordinal: 1, length: 17, angle: (Math.PI * 5) / 8, protrusion: -1 }, // left tail
    l: { ordinal: 2, length: 20, angle: Math.PI / 2, protrusion: -1 }, // left
    hl: { ordinal: 3, length: 20, angle: Math.PI / 4, protrusion: -1 }, // head left
    h: { ordinal: 4, length: 17, angle: 0, protrusion: -1 }, // head
    hr: { ordinal: 5, length: 20, angle: -Math.PI / 4, protrusion: -1 }, // head right
    r: { ordinal: 6, length: 20, angle: -Math.PI / 2, protrusion: -1 }, // right
    tr: { ordinal: 7, length: 17, angle: (-Math.PI * 5) / 8, protrusion: -1 }, // right tail
  }

  static {
    Object.keys(this.defs).forEach(id => {
      const def = this.defs[id as WhiskerId]
      def.protrusion = def.length - radius
    })
  }

  static ids() {
    return Object.keys(this.defs) as WhiskerId[]
  }

  static getProtrusion(id: WhiskerId) {
    return this.defs[id].protrusion
  }

  // The length of the whisker from the center of the agent body.
  static getLength(id: WhiskerId) {
    return this.defs[id].length
  }

  //   // The angle from the nose that the whisker protrudes.
  static getAngle(id: WhiskerId) {
    return this.defs[id].angle
  }

  static getOrdinal(id: WhiskerId) {
    return this.defs[id].ordinal
  }

  static getIdForOrdinal(ordinal: number) {
    return this.maybeGetIdForOrdinal(ordinal) as WhiskerId
  }
  static maybeGetIdForOrdinal(ordinal: number) {
    return Object.keys(this.defs).find(id => this.defs[id as WhiskerId].ordinal === ordinal)
  }

  // Returns the side ('r' or 'l') of the first id that has one of these values.
  static side(ids: WhiskerId[]) {
    for (let i = 0; i < ids.length; i++) {
      if (ids[i].includes('r')) {
        return 'r'
      }
      if (ids[i].includes('l')) {
        return 'l'
      }
    }
  }
}

export default class Physiology {
  physiologicalBehaviour?: PhysiologicalBehaviour
  resistances = []
  world
  bug
  body
  sensors
  actuators
  controller
  previousAngle
  previousPosition
  nose
  resources

  constructor(world: World) {
    this.world = world

    this.bug = world.createDynamicBody({
      angle: angle,
      linearDamping: 0.1,
      position: Vec2(offsetX, offsetY),
    })
    this.body = this.bug.createFixture({
      // restitution: 0.8,
      userData: agentBodyId,
      shape: Circle(radius),
    })
    // this.body.style.stroke = '#400'
    this.body.style.fill = '#0088ff'
    WhiskerDefs.ids().forEach(id => {
      const fixtureDef = createWhiskerFixtureDef(id, WhiskerDefs.getLength(id), WhiskerDefs.getAngle(id))
      const fixture = this.bug.createFixture(fixtureDef)
      fixture.style.stroke = '#05af'
      fixture.style.fill = ''
    })

    this.sensors = new Sensors()
    this.actuators = new Actuators()
    this.controller = new Controller(this.sensors, this.actuators)
    this.previousAngle = this.bug.getAngle()
    this.previousPosition = this.bug.getPosition()
    this.nose = new Nose(this.sensors)
    this.resources = new Resources(this.sensors, this.actuators)
  }

  step(evt: StepEvent) {
    const { actuators, body, bug, controller, resources, sensors } = this
    const { whiskers } = sensors
    const pos = bug.getPosition()

    // Update sensors
    sensors.clear()
    resources.updateSensors()
    this.physiologicalBehaviour?.updateSensors(evt)

    // Contact handling
    let noseContactBody: Body | null = null
    forEachContactEdge(bug.getContactList(), edge => {
      if (!edge.contact.isTouching()) return
      if (!edge.contact.isEnabled()) throw Error('contact is not enabled')
      if (!edge.other) throw Error('no other')

      const other = edge.other
      let bugFixture
      let otherFixture
      if (edge.contact.getFixtureA().getBody() === other) {
        bugFixture = edge.contact.getFixtureB()
        otherFixture = edge.contact.getFixtureA()
      } else {
        bugFixture = edge.contact.getFixtureA()
        otherFixture = edge.contact.getFixtureB()
      }

      if (bugFixture === body) {
        // Contact with the agent body. We want to record the angles of the contact points
        // relative to the head.
        // The contact points are not reliable, so we calculate the intersections with the
        // other body. But we still want the impulses.
        const normalImpulse = edge.contact.getManifold().points[0].normalImpulse
        const tangentImpulse = edge.contact.getManifold().points[0].tangentImpulse

        const angles = intersectionPoints(body, otherFixture)
        angles.forEach(a => {
          sensors.bodyContacts.push({
            angle: blurAngle(a),
            normalImpulse: blur(normalImpulse),
            tangentImpulse: blur(tangentImpulse),
            // id: otherBody.id, // TODO remove this
            // isStatic: otherBody.isStatic, // TODO remove this
            // edibleType: otherBody.edibleType, // TODO remove this
            // mass: otherBody.mass,
          })
          const p = rotate(Vec2(radius, 0), a + bug.getAngle()).add(bug.getPosition())
          evt.debugRenderers.push(h => h.dot(p.x, p.y, 2, '#f88'))
        })
      } else {
        // Whisker
        const id = bugFixture.getUserData() as WhiskerId
        if (!id) throw Error('no whisker id')

        const intersection = whiskers.nearestIntersectionPoint(bugFixture, otherFixture, pos)
        // If we can't calculate an intersection, don't register the contact.
        if (intersection) {
          evt.debugRenderers.push(h => h.dot(intersection.x, intersection.y, 1, '#aaa'))
          const depth = WhiskerDefs.getLength(id) - intersection.distance
          const added = whiskers.add(id, blur(depth))
          if (added && id === 'h') {
            noseContactBody = other
          }
        }
      }
    })

    evt.position = Vec2(pos) // remove this
    evt.angle = bug.getAngle() // remove this
    const velocity = Vec2.sub(pos, this.previousPosition)
    // Velocity is in the world FOR. Rotate to the agent FOR.
    sensors.prevVelocityAchieved = blurVector(rotate(velocity, -bug.getAngle(), true))
    sensors.prevAngularVelocityAchieved = blur(bug.getAngle() - this.previousAngle)
    this.nose.step(evt, noseContactBody)
    sensors.ambience = Ambience.queryNearest(pos.x, pos.y).value
    this.previousAngle = bug.getAngle()
    this.previousPosition = Vec2(pos)
    evt.debugProps.Position = `${Math.round(pos.x)}, ${Math.round(pos.y)}`
    evt.debugProps.Ambience = Ambience.asHex(sensors.ambience)
    // sensors.bodyContacts.forEach(c => {
    //   // Pattern detection
    //   const v = rotate(Vec2(sensors.prevSpeedAttempted, 0), -c.angle)
    //   const v2 = rotate(sensors.prevVelocityAchieved, -c.angle)
    //   this.resistances.push({
    //     ...c,
    //     //         ts: evt.timestamp,
    //     //         attempted: blur(v.x),
    //     //         achieved: blur(v2.x),
    //     //         speed: sensors.prevVelocityAchieved.x,
    //     //         sidle: sensors.prevVelocityAchieved.y,
    //     //         turn: sensors.prevAngularVelocityAchieved,
    //   })
    // })

    if (resources.isUnconscious()) {
      evt.debugProps.State = 'Unconscious'
    } else if (resources.isDead()) {
      evt.debugProps.State = 'Dead'
    } else {
      // Step the controller. We do this even if there is a physiological behaviour because the
      // agent shouldn't lose consciousness while they are running.
      controller.step(evt)
      if (this.physiologicalBehaviour) {
        if (this.physiologicalBehaviour.done(evt)) {
          this.physiologicalBehaviour = undefined
        } else {
          this.physiologicalBehaviour.step(evt)
        }
      } else if (actuators.startDrink || actuators.startEat) {
        const klass = actuators.startDrink ? Drink : Eat
        const removeFn = () => {
          if (noseContactBody) this.world.destroyBody(noseContactBody)
        }

        const edibleType = (noseContactBody as EdibleBody | null)?.edibleType
        this.physiologicalBehaviour = new klass(sensors, actuators, evt, resources, edibleType, removeFn)
      }

      sensors.prevTurnWanted = actuators.turn
      sensors.prevSpeedWanted = actuators.speed
      sensors.prevSidleWanted = actuators.sidle
      resources.updateActuators()

      // Clamp actuator values to agent maximums.
      actuators.clampTurn(1)
      actuators.clampSpeed(1)
      actuators.clampSidle(1)
      sensors.prevTurnAttempted = blurAngle(actuators.turn)
      sensors.prevSpeedAttempted = blur(actuators.speed)
      sensors.prevSidleAttempted = blur(actuators.sidle)

      // Read the actuators
      //       Sleeping.set(bug, false)
      bug.setAngle(bug.getAngle() + actuators.turn)
      bug.setLinearVelocity(rotate(Vec2(actuators.speed * 60, actuators.sidle * 60), bug.getAngle()))
      evt.debugProps.Turn = `${shorten(actuators.turn)} (${shorten(sensors.prevTurnWanted)})`
      evt.debugProps.Speed = `${shorten(actuators.speed)} (${shorten(sensors.prevSpeedWanted)})`
      evt.debugProps.Sidle = `${shorten(actuators.sidle)} (${shorten(sensors.prevSidleWanted)})`
    }
    resources.metabolize(evt)
    evt.debugProps.Nose = `${Texture.asHex(sensors.noseTexture)} / ${Scent.asHex(sensors.noseScent)}`
  }
}

// angle - the angle of protrusion from the center of the agent body
const createWhiskerFixtureDef = (id: WhiskerId, length: number, angle: number) => {
  const hw = WhiskerDefs.width / 2
  const vertices = [Vec2(0, hw), Vec2(length, hw), Vec2(length, -hw), Vec2(0, -hw)].map(v => rotate(v, angle, true))
  return {
    isSensor: true,
    userData: id,
    shape: Polygon(vertices),
  } as FixtureDef
}

const blur = (n: number) => Number(n.toPrecision(sensorPrecision))

const blurVector = (v: Vec2) => {
  v.x = Number(v.x.toPrecision(sensorPrecision))
  v.y = Number(v.y.toPrecision(sensorPrecision))
  return v
}

// Rounds numbers to the nearest 0.05
const blurAngle = (a: number) => Number((a * 2).toFixed(1)) / 2

interface NearestPoint extends Vec2 {
  type?: 'intersection' | 'vertex'
  distanceSq?: number
}
const edgeAABB = AABB()
const CONTACT_RADIUS = radius * 1.01
const intersectionPoints = (agentFixture: Fixture, otherFixture: Fixture) => {
  if (agentFixture.getShape().getType() !== 'circle') throw Error('Agent shape must be a circle')

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
      Vec2(pos.x - CONTACT_RADIUS, pos.y - CONTACT_RADIUS),
      Vec2(pos.x + CONTACT_RADIUS, pos.y + CONTACT_RADIUS),
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
      const factor = CONTACT_RADIUS / perp.length()
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
