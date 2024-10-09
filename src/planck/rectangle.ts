import { Vec2 } from 'planck'

export default class Rectangle {
  x
  y
  w
  h

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }

  contains(vector: Vec2): boolean
  contains(x: number, y: number): boolean
  contains(x: Vec2 | number, y?: number) {
    if (x instanceof Vec2) {
      y = x.y
      x = x.x
    } else {
      y = 0
    }
    return x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h
  }
}
