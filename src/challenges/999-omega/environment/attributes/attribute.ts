import { gaussian, isNil } from '../../../../util'

type Centroid = number
type Sigma = number
export type AttributeDefinitions = [Centroid, Sigma][]
export type AttributeValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15

export default class Attribute {
  static elementCount: number

  static generate(centroidsAndSigmas: AttributeDefinitions): AttributeValue {
    let n = 0
    centroidsAndSigmas.forEach(([cent, sigma], index) => {
      if (cent < 0 || cent >= 16) throw new Error('not in range')
      const a = this.clamp(gaussian() * sigma + cent)
      n += a << ((centroidsAndSigmas.length - index - 1) * 4)
    })
    return n as AttributeValue
  }

  static asHex(n?: AttributeValue, len = this.elementCount) {
    if (isNil(n)) return '--'
    const a = `00000000${n?.toString(16)}`
    return a.slice(-len)
  }

  // Calculate the average by summing the average of each element.
  static average(n1: AttributeValue, n2: AttributeValue, len = this.elementCount): AttributeValue {
    let avg = 0
    let shift = 0
    for (let i = 0; i < len; i++) {
      const e = (((n1 >> shift) & 0xf) + ((n2 >> shift) & 0xf)) / 2
      // Odd number produce 0.5 floats. Resolve to integers randomly.
      avg += Math.round(e + (Math.random() - 0.5) / 2) << shift
      shift += 4
    }
    return avg as AttributeValue
  }

  static clamp(v: number) {
    if (v < 0) return 0
    if (v > 15) return 15
    return Math.round(v)
  }
}
