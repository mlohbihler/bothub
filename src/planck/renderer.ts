import {
  Body,
  ChainShape,
  CircleShape,
  EdgeShape,
  Fixture,
  Joint,
  PolygonShape,
  World,
  Vec2,
  AABB,
  Transform,
  RevoluteJoint,
  Style,
} from 'planck'
import { getContext, isNil } from '../util'
import { forEachNextable } from './boxUtil'

export interface RendererOptions {
  scaleFactor: number
  offset: Vec2
  drawJoints: boolean
  drawOrientations: boolean
  lineWidth: number
}

interface WorldStageOptions {
  scaleFactor: number
  lineWidth: number
  stroke?: string
  fill?: string
}

interface Rendered {
  offscreenCanvas: OffscreenCanvas
  offset: Vec2
  offsetDistance: number
  lastPosition?: Vec2
  lastRotation?: number
}
type Renderable = Body | Fixture | Joint

interface RenderOptions extends WorldStageOptions {
  viewPortBounds: AABB
}

export default class Renderer {
  zoonIncrement = 1.3

  cx
  scaleFactor
  lineWidth
  drawJoints
  drawOrientations
  offset

  rendereds = new Map<Renderable, Rendered | null>()

  constructor(cx: CanvasRenderingContext2D, options: Partial<RendererOptions>) {
    this.cx = cx
    this.scaleFactor = options.scaleFactor ?? 1
    this.offset = options.offset ?? Vec2(0, 0)
    this.lineWidth = options.lineWidth ?? 0.2
    this.drawJoints = options.drawJoints ?? false
    this.drawOrientations = options.drawOrientations ?? false
  }

  zoom(zoomIn: boolean, x: number, y: number) {
    const scaleChange = zoomIn ? 1 / this.zoonIncrement : this.zoonIncrement
    const factor = this.scaleFactor * scaleChange
    // Get the current world position.
    const worldBefore = this.offsetToWorld(x, y)
    // Adjust the scale factor
    this.setScaleFactor(factor)
    // Fix the offset so the mouse is at the original world position.
    const worldAfter = this.offsetToWorld(x, y)
    this.moveOffset((worldAfter.x - worldBefore.x) * factor, (worldBefore.y - worldAfter.y) * factor)
  }

  setScaleFactor(n: number) {
    this.scaleFactor = n
    this.rendereds.clear()
  }

  moveOffset(x: number, y: number) {
    this.offset.x += x
    this.offset.y += y
  }

  setOffset(x: number, y: number) {
    this.offset.x = x
    this.offset.y = y
  }

  offsetToCanvas(x: number, y: number) {
    return Vec2(x - this.offset.x, this.offset.y - y)
  }

  offsetToWorld(x: number, y: number) {
    return Vec2((x - this.offset.x) / this.scaleFactor, (this.offset.y - y) / this.scaleFactor)
  }

  worldToCanvas(x: number, y: number) {
    return Vec2(x * this.scaleFactor, y * this.scaleFactor)
  }

  inWorldCanvas(fn: (cx: CanvasRenderingContext2D) => void, zoom = true) {
    const { cx, scaleFactor, offset } = this

    cx.translate(offset.x, offset.y)
    const scale = zoom ? scaleFactor : 1
    cx.scale(scale, -scale) // Flips things so that y values increase upwards.

    fn(cx)

    cx.resetTransform()
  }

  getWorldCanvas() {
    const { cx, scaleFactor, offset } = this

    cx.translate(offset.x, offset.y)
    cx.scale(scaleFactor, -scaleFactor) // Flips things so that y values increase upwards.

    return cx
  }

  render(world: World) {
    const { cx, scaleFactor, offset } = this

    cx.resetTransform()
    cx.clearRect(0, 0, cx.canvas.width, cx.canvas.height)
    this.inWorldCanvas(cx => {
      const options = {
        lineWidth: this.lineWidth,
        scaleFactor,
        viewPortBounds: AABB(Vec2(-offset.x, offset.y - cx.canvas.height), Vec2(cx.canvas.width - offset.x, offset.y)),
      }
      forEachNextable(world.getBodyList(), body => this.renderBody(body, options))

      if (this.drawJoints) {
        // Hack for drawing joints. They really should be buffered like everything else (unless
        // there are dynamic elements in the drawings).
        cx.scale(scaleFactor, scaleFactor)
        forEachNextable(world.getJointList(), joint => this.renderJoint(joint, options))
      }
    }, false)
  }

  renderBody(body: Body, options: RenderOptions) {
    const { cx, scaleFactor } = this

    let rendered = this.rendereds.get(body)
    if (rendered === undefined) {
      if (body.getFixtureList()) {
        const [aabb, maxLineWidth] = this.getBodyAABB(body, options.lineWidth)
        // Add maxLineWidth to the AABB to allow for high line widths in strokes.
        aabb.lowerBound.x -= maxLineWidth
        aabb.lowerBound.y -= maxLineWidth
        aabb.upperBound.x += maxLineWidth
        aabb.upperBound.y += maxLineWidth

        const width = (aabb.upperBound.x - aabb.lowerBound.x) * scaleFactor
        const height = (aabb.upperBound.y - aabb.lowerBound.y) * scaleFactor
        const offscreenCanvas = new OffscreenCanvas(Math.ceil(width), Math.ceil(height))
        const ocx = getContext(offscreenCanvas) as OffscreenCanvasRenderingContext2D
        ocx.scale(scaleFactor, scaleFactor)
        ocx.translate(-aabb.lowerBound.x, -aabb.lowerBound.y)

        this.renderFixtures(body, ocx, options)

        rendered = {
          offscreenCanvas,
          offset: aabb.lowerBound,
          offsetDistance: this.calculateMaximumOffsetDistance(aabb),
        }
      } else {
        rendered = null
      }
      this.rendereds.set(body, rendered)
    }

    if (rendered) {
      const position = body.getPosition()
      const rotation = body.getAngle()
      rendered.lastPosition = position
      rendered.lastRotation = rotation

      const px = position.x * scaleFactor
      const py = position.y * scaleFactor

      // Only render if the body is within viewport bounds.
      const renderedBounds = AABB(
        Vec2(px - rendered.offsetDistance, py - rendered.offsetDistance),
        Vec2(px + rendered.offsetDistance, py + rendered.offsetDistance),
      )

      if (AABB.testOverlap(options.viewPortBounds, renderedBounds)) {
        const ogxf = cx.getTransform()
        cx.translate(position.x * scaleFactor, position.y * scaleFactor)
        cx.rotate(rotation)
        cx.drawImage(rendered.offscreenCanvas, rendered.offset.x * scaleFactor, rendered.offset.y * scaleFactor)
        cx.setTransform(ogxf)
      }
    }
  }

  getBodyAABB(body: Body, defaultLineWidth: number): [AABB, number] {
    const xf = new Transform()

    let union: AABB | null = null
    const bodyLineWidth = this.getStyle(body).lineWidth
    let maxLineWidth = 0
    forEachNextable(body.getFixtureList(), fixture => {
      const aabb = new AABB()

      // Chains do not calculate the AABB properly IMO.
      if (fixture.getType() == 'chain') {
        const chain = fixture.getShape() as ChainShape
        const vertices = chain.m_vertices
        const lower = Vec2(Infinity, Infinity)
        const upper = Vec2(-Infinity, -Infinity)
        for (let i = 0; i < vertices.length; i++) {
          const v = vertices[i]
          if (lower.x > v.x) lower.x = v.x
          if (lower.y > v.y) lower.y = v.y
          if (upper.x < v.x) upper.x = v.x
          if (upper.y < v.y) upper.y = v.y
        }
        aabb.lowerBound = lower
        aabb.upperBound = upper
      } else {
        fixture.getShape().computeAABB(aabb, xf, 0)
      }

      if (union) {
        union.combine(aabb)
      } else {
        union = aabb
      }

      maxLineWidth = Math.max(maxLineWidth, this.getStyle(fixture).lineWidth ?? bodyLineWidth ?? defaultLineWidth ?? 0)
    })
    return [union ?? new AABB(), maxLineWidth]
  }

  calculateMaximumOffsetDistance(aabb: AABB) {
    // For calculation of whether the body is visible in the viewport, we calculate the maximum
    // distance from the offset of any corner of the canvas. We can then use this to know whether
    // any rotation of the canvas might be within the viewport bounds.
    const max = (lsq1: number, x: number, y: number) => {
      const lsq2 = x * x + y * y
      return lsq1 > lsq2 ? lsq1 : lsq2
    }
    let maxSq = max(0, aabb.lowerBound.x, aabb.lowerBound.y)
    maxSq = max(maxSq, aabb.lowerBound.x, aabb.upperBound.y)
    maxSq = max(maxSq, aabb.upperBound.x, aabb.upperBound.y)
    maxSq = max(maxSq, aabb.upperBound.x, aabb.lowerBound.y)
    return Math.sqrt(maxSq) * this.scaleFactor
  }

  renderFixtures(body: Body, cx: OffscreenCanvasRenderingContext2D, options: WorldStageOptions) {
    forEachNextable(body.getFixtureList(), fixture => {
      const fixtureOptions: Style = {}
      const fstyle = this.getStyle(fixture)
      const bstyle = this.getStyle(body)
      fixtureOptions.stroke = fstyle?.stroke ?? bstyle?.stroke ?? options.stroke
      if (isNil(fixtureOptions.stroke)) {
        if (body.isDynamic()) {
          fixtureOptions.stroke = 'rgba(255,255,255,0.9)'
        } else if (body.isKinematic()) {
          fixtureOptions.stroke = 'rgba(255,255,255,0.7)'
        } else if (body.isStatic()) {
          fixtureOptions.stroke = 'rgba(255,255,255,0.5)'
        }
      }

      fixtureOptions.fill = fstyle?.fill ?? bstyle?.fill ?? options.fill ?? ''
      fixtureOptions.lineWidth = fstyle?.lineWidth ?? bstyle?.lineWidth ?? options.lineWidth
      fixtureOptions.drawOrientation = fstyle?.drawOrientation ?? bstyle?.drawOrientation ?? this.drawOrientations
      const type = fixture.getType()
      const shape = fixture.getShape()

      if (type == 'circle') {
        this.drawCircle(shape as CircleShape, cx, fixtureOptions)
      } else if (type == 'edge') {
        this.drawEdge(shape as EdgeShape, cx, fixtureOptions)
      } else if (type == 'polygon') {
        this.drawPolygon(shape as PolygonShape, cx, fixtureOptions)
      } else if (type == 'chain') {
        this.drawChain(shape as ChainShape, cx, fixtureOptions)
      } else {
        console.warn(`unknown type: ${type}`)
      }
    })
  }

  drawCircle(shape: CircleShape, cx: OffscreenCanvasRenderingContext2D, options: Style) {
    const r = shape.m_radius
    cx.beginPath()
    cx.arc(0, 0, r, 0, 2 * Math.PI)
    if (options.fill) {
      cx.fillStyle = options.fill
      cx.fill()
    }
    if (options.stroke) {
      if (options.drawOrientation) cx.lineTo(0, 0)
      cx.lineWidth = options.lineWidth ?? 1
      cx.strokeStyle = options.stroke ?? ''
      cx.stroke()
    }
  }

  drawEdge(edge: EdgeShape, cx: OffscreenCanvasRenderingContext2D, options: Style) {
    const v1 = edge.m_vertex1
    const v2 = edge.m_vertex2

    cx.beginPath()
    cx.moveTo(v1.x, v1.y)
    cx.lineTo(v2.x, v2.y)

    cx.lineCap = 'round'
    cx.lineWidth = options.lineWidth ?? 1
    cx.strokeStyle = options.stroke ?? ''
    cx.stroke()
  }

  drawPolygon(shape: PolygonShape, cx: OffscreenCanvasRenderingContext2D, options: Style) {
    const vertices = shape.m_vertices
    if (!vertices.length) {
      return
    }

    cx.beginPath()
    for (let i = 0; i < vertices.length; ++i) {
      const v = vertices[i]
      const x = v.x
      const y = v.y
      if (i == 0) cx.moveTo(x, y)
      else cx.lineTo(x, y)
    }

    if (vertices.length > 2) {
      cx.closePath()
    }

    if (options.fill) {
      cx.fillStyle = options.fill
      cx.fill()
    }

    if (options.stroke) {
      cx.lineCap = 'round'
      cx.lineWidth = options.lineWidth ?? 1
      cx.strokeStyle = options.stroke ?? ''
      cx.stroke()
    }
  }

  drawChain(shape: ChainShape, cx: OffscreenCanvasRenderingContext2D, options: Style) {
    const vertices = shape.m_vertices
    if (!vertices.length) {
      return
    }

    cx.beginPath()
    for (let i = 0; i < vertices.length; ++i) {
      const v = vertices[i]
      if (i == 0) cx.moveTo(v.x, v.y)
      else cx.lineTo(v.x, v.y)
    }

    // if (shape.isLoop()) {
    //   cx.closePath();
    // }

    if (options.fill) {
      cx.fillStyle = options.fill
      cx.fill()
      cx.closePath()
    }

    cx.lineCap = 'round'
    cx.lineWidth = options.lineWidth ?? 1
    cx.strokeStyle = options.stroke ?? ''
    cx.stroke()
  }

  getStyle(obj: Body | Fixture | Joint): Style {
    return obj['style'] ?? {}
  }

  renderJoint(joint: Joint, options: RenderOptions) {
    const type = joint.getType()

    if (type === 'revolute-joint') {
      this.drawRevoluteJoint(joint as RevoluteJoint, options)
    } else {
      // console.log(`No renderer for joint type '${type}'`)
    }
  }

  drawRevoluteJoint(joint: RevoluteJoint, options: RenderOptions) {
    const { cx } = this

    const anchorA = joint.getAnchorA()

    cx.strokeStyle = joint.style.stroke ?? '#00fa'
    cx.lineWidth = options.lineWidth
    cx.beginPath()
    cx.ellipse(anchorA.x, anchorA.y, 0.2, 0.2, 0, 0, Math.PI * 2)
    cx.stroke()
  }
}
