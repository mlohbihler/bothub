declare module 'kld-intersections' {
  import { ShapeInfo, Intersection } from 'kld-intersections'

  export class ShapeInfo {
    static line(from: [number, number], to: [number, number]): ShapeInfo
    static circle(center: [number, number], radius: number): ShapeInfo
  }

  interface IntersectionResult {
    points: { x: number; y: number }[]
  }

  export class Intersection {
    static intersect(shape1: ShapeInfo, shape2: ShapeInfo): IntersectionResult
  }
}
