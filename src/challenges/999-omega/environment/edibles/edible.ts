import { gaussian } from '../../../util'
import Texture from '../attributes/texture'
import Scent from '../attributes/scent'
import PeriodTimeout from '../../tools/periodTimeout'
import { AttributeDefinitions } from '../attributes/attribute'
import { AABB, Body, Shape, Vec2, World } from 'planck'
import { rotate } from '../../../boxUtil'
import { PerceptibleBody, PerceptibleBodyDef, StepEvent } from '../../../@types'

export interface EdibleBodyData {
  bestBefore: number
  edibleType: string
}
export interface EdibleBody extends PerceptibleBody, EdibleBodyData {}
export interface EdibleBodyDef extends PerceptibleBodyDef, EdibleBodyData {}

export default class Edible {
  static periodSteps: number
  static startCount: number
  static expiry: number
  static resourceAmounts: Map<string, number> // could also be an array of two-element arrays
  static textureDef: AttributeDefinitions
  static scentDef: AttributeDefinitions
  static radius: number // Needed to determine if new instances overlap any static bodies.

  world: World
  bodies: EdibleBody[] = []
  timeout: PeriodTimeout

  constructor(world: World) {
    this.world = world
    const ctor = this.constructor as typeof Edible
    for (let i = 0; i < ctor.startCount; i++) {
      // TODO: these all have the same expiry time, which causes them all to disappear at the same
      // time. The expiries should be somehow spread out.
      this.create(0)
    }
    this.timeout = new PeriodTimeout(ctor.periodSteps, evt => {
      this.create(evt.step)
      this.expire(evt.step)
    })
  }

  step(evt: StepEvent) {
    this.timeout.step(evt)
  }

  static gaussian(radius = 20) {
    return gaussian() * radius * 2 - radius
  }

  static random(radius = 50) {
    return Math.random() * radius * 2 - radius
  }

  nearbyPosition(defaultX: number, defaultY: number, radius = 50) {
    const { bodies } = this
    const { random } = Edible

    let pos = this.findAvailablePosition(() => {
      // Determine the location of the new body by choosing a random existing body and randomizing a
      // locations near it.
      let pos: Vec2
      if (bodies.length) {
        const r = Math.floor(Math.random() * bodies.length)
        pos = bodies[r].getPosition().clone()
      } else {
        pos = Vec2(defaultX, defaultY)
      }
      pos.x += random(radius)
      pos.y += random(radius)
      return pos
    })

    return pos
  }

  centroidPosition(x: number, y: number, distanceFactor = 1): Vec2 | null {
    return this.findAvailablePosition(() => {
      const v = Vec2(Edible.gaussian() * distanceFactor, 0)
      const angle = Math.random() * Math.PI * 2
      rotate(v, angle, true)
      v.x += x
      v.y += y
      return v
    })
  }

  findAvailablePosition(createPosition: (p?: Vec2) => Vec2) {
    const r = (this.constructor as typeof Edible).radius

    let remaining = 10
    let position = createPosition()
    while (true) {
      const aabb = AABB(Vec2(position.x - r, position.y - r), Vec2(position.x + r, position.y + r))
      let staticOverlap = false
      this.world.queryAABB(aabb, fixture => {
        staticOverlap = fixture.getBody().isStatic() && fixture.testPoint(position)
        return !staticOverlap
      })
      if (!staticOverlap) break

      // Abort if this runs too long
      remaining--
      if (remaining <= 0) {
        console.warn('Gave up trying to find a location for a new body', this.constructor.name)
        return null
      }
      position = createPosition(position)
    }
    return position
  }

  createBody(_step: number, _defaults: EdibleBodyDef): EdibleBody | undefined {
    throw new Error('not implemented')
  }

  create(step: number) {
    const { expiry, name, scentDef, textureDef } = this.constructor as typeof Edible
    const { bodies } = this

    const body = this.createBody(step, {
      linearDamping: 3,
      edibleType: name,
      texture: Texture.generate(textureDef),
      scent: Scent.generate(scentDef),
      bestBefore: step + expiry,
    }) as EdibleBody

    if (body) bodies.push(body)
  }

  createFromLocationAndShape(location: Vec2, bodyDef: EdibleBodyDef, shape: Shape, color: string) {
    bodyDef.position = location
    const body = this.world.createDynamicBody(bodyDef) as EdibleBody
    body.createFixture({ shape })
    body.style = {
      fill: `${color}8`,
      stroke: `${color}f`,
    }
    body.edibleType = bodyDef.edibleType
    body.texture = bodyDef.texture
    body.scent = bodyDef.scent
    body.bestBefore = bodyDef.bestBefore

    return body
  }

  expire(step: number) {
    const { bodies, world } = this

    // Check if there are bodies that should be removed. These bodies may have already been removed
    // by agents, but Planck doesn't seem to mind.
    while (bodies.length > 0 && bodies[0].bestBefore < step) {
      world.destroyBody(bodies.shift() as Body)
    }
  }

  static presentSeason(step: number, seasonDuration: number, seasonCount: number) {
    return Math.floor((step % (seasonDuration * seasonCount)) / seasonDuration)
  }
}
