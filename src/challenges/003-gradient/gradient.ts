import { minmax } from '../../util'

const moves = [
  '',
  'u g',
  'u',
  'u',
  'ur',
  'r',
  'ur',
  'u',
  'u',
  'u',
  'ur',
  'ur',
  'r',
  'ur',
  'u',
  'ul',
  'ul',
  'u',
  'u',
  'ul g',
  'u',
  'u',
  'ur',
  'u',
  'ur',
  'ur',
  'u',
  'u',
  'ur',
  'ur',
  'ur',
  'u',
  'ul',
  'ur',
  'ur',
  'r',
  'ur',
  'r',
  'dr',
  'dr',
  'd',
  'd g',
  'd',
  'dr',
  'r',
  'r',
  'ur',
  'ur',
  'ur',
  'r',
  'r',
  'ur',
  'ur',
  'ur',
  'r',
  'dr',
  'dr',
  'dr g',
  'r',
  'r',
  'dr',
  'd',
  'dl',
  'dl',
  'l',
  'l',
  'dl',
  'dl',
  'd',
  'dr',
  'r',
  'r',
  'r',
  'r',
  'r',
  'ur',
  'ur',
  'ur',
  'r',
  'r',
  'dr',
  'dr',
  'dr',
  'dr',
  'd',
  'd',
  'dl g',
  'dl',
  'dl',
  'dl',
  'l',
  'l',
  'l',
  'l',
  'l',
  'dl',
  'dl',
  'l',
  'l',
  'dl',
  'dl',
  'd',
  'dr g',
  'dr',
  'd',
  'd',
  'dl',
  'dl',
  'l',
  'l',
  'l',
  'ul',
  'u',
  'ul',
  'ul',
  'u',
  'u',
  'u g',
  'u',
  'u',
  'u',
  'ul',
  'ul',
  'l',
  'l',
  'l',
  'ld g',
  'd',
  'd',
  'd',
  'd',
  'dr',
  'd',
  'd',
  'd',
  'd',
  'd',
  'dr',
  'dr',
  'd',
  'd g',
]

const updateCoordinates = (coords: [number, number], move: string) => {
  if (move.includes('r')) coords[0]++
  if (move.includes('l')) coords[0]--
  if (move.includes('u')) coords[1]++
  if (move.includes('d')) coords[1]--
}

const createPath = (start: [number, number]) => {
  const current: [number, number] = [...start]
  return moves.map(move => {
    updateCoordinates(current, move)
    return [...current] as [number, number]
  })
}

const xPadding = [2, 13]
const yPadding = [8, 10]

const neighbours = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
] as [number, number][]

export const createGradient = () => {
  const path = createPath([xPadding[0], yPadding[0]])

  // Get the range of the coordinates
  const xRange = minmax(path.map(c => c[0]))
  const yRange = minmax(path.map(c => c[1]))
  xRange[0] -= xPadding[0]
  xRange[1] += xPadding[1]
  yRange[0] -= yPadding[0]
  yRange[1] += yPadding[1]

  if (xRange[0] < 0 || yRange[0] < 0) {
    throw Error('Invalid range')
  }

  // Create the gradient map
  let gradients: number[][] = []
  path.forEach(([x, y], index) => {
    if (!gradients[x]) gradients[x] = []
    gradients[x][y] = index
  })

  // Fill in the empty cells
  let changed = true
  let iterations = 0
  while (changed) {
    changed = false
    let nextGradients = gradients.map(ys => [...ys])

    for (let x = xRange[0]; x <= xRange[1]; x++) {
      if (!gradients[x]) {
        gradients[x] = []
        nextGradients[x] = []
      }

      for (let y = yRange[0]; y <= yRange[1]; y++) {
        if (gradients[x][y] === undefined) {
          const [count, sum] = neighbours.reduce(
            ([cnt, sm], [dx, dy]) => {
              if (gradients[x + dx] && gradients[x + dx][y + dy] !== undefined) {
                cnt++
                sm += gradients[x + dx][y + dy]
              }
              return [cnt, sm]
            },
            [0, 0],
          )

          if (count > 1) {
            changed = true
            nextGradients[x][y] = Math.max(Math.floor((sum / count) * 0.75 - 0.5), 0)
          }
        }
      }
    }

    gradients = nextGradients
    iterations++
  }

  // console.log(gradients.map(ys => ys.map(a => a.toString().padStart(3, ' '))))

  return gradients
}

export default class Gradient {
  gradientValues = createGradient()
  offset = [xPadding[0], yPadding[0]]
  scale = 9

  amountAt(x: number, y: number) {
    x = Math.floor(x / this.scale) + xPadding[0]
    y = Math.floor(y / this.scale) + yPadding[0]
    return (this.gradientValues[x] && this.gradientValues[x][y]) ?? 0
  }

  pathLength() {
    return moves.length
  }

  range() {
    return {
      from: {
        x: -xPadding[0] * this.scale,
        y: -yPadding[0] * this.scale,
      },
      to: {
        x: (this.gradientValues.length + xPadding[1]) * this.scale,
        y: (this.gradientValues[0].length + yPadding[1]) * this.scale,
      },
    }
  }

  getGoalCoordinates() {
    const goals: [number, number][] = []
    const current: [number, number] = [0, 0]
    moves.forEach(move => {
      updateCoordinates(current, move)
      if (move.includes('g')) {
        goals.push([...current])
      }
    })
    return goals
  }
}
