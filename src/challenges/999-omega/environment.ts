import { Circle, Edge, Polygon, Shape, Vec2, World } from 'planck'
// import TerrainData from '../assets/terrain.svg?raw'
// import TerrainData from '/src/assets/svg.svg?raw'
import Physiology from './physiology'
import Water from './environment/edibles/water'
import Bracizza from './environment/edibles/bracizza'
import Digizza from './environment/edibles/digizza'
import Lamizza from './environment/edibles/lamizza'
import Reyzza from './environment/edibles/reyzza'
import Sugazza from './environment/edibles/sugazza'
import Texture from './environment/attributes/texture'
import Scent from './environment/attributes/scent'
import Ambience from './environment/attributes/ambience'
// import Edible from './environment/edibles/edible'
import { AttributeDefinitions } from './environment/attributes/attribute'
import { PerceptibleBody, StepEvent, Steppable } from '../@types'

export default class Environment {
  updatables: Steppable[] = []
  agent

  constructor(world: World) {
    // Obstacles
    //       // svgObstacle(600, 600),
    simpleObstacle(world, 600, 1000)
    // circularObstacle(world, 500, 600, 100)
    // circularObstacle(world, 700, 600, 500)

    // TODO: Try using edges instead.
    border(world, 0, 0, 0, 1600)
    border(world, 0, 1600, 1600, 0)
    border(world, 1600, 1600, 0, -1600)
    border(world, 1600, 0, -1600, 0)

    // Updatables
    const agent = new Physiology(world)
    this.agent = agent
    this.updatables.push(agent)
    this.updatables.push(new Water(world))
    this.updatables.push(new Bracizza(world))
    this.updatables.push(new Digizza(world))
    this.updatables.push(new Lamizza(world))
    this.updatables.push(new Reyzza(world))
    this.updatables.push(new Sugazza(world))
    Ambience.initialize()
    this.updatables.push(Ambience)
  }

  //   getAgent() {
  //     return this.agent
  //   }

  step(evt: StepEvent) {
    this.updatables.forEach(e => e.step(evt))
  }
}

const obstacleTextureDef: AttributeDefinitions = [
  [10, 3], //smoothness
  [4, 1.5], // temperature
  [15, 0.1], // solidity
]

const obstacleScentDef: AttributeDefinitions = [
  [0, 0.5],
  [0, 0.5],
  [0, 0.5],
  [3, 0.5],
]

// const svgObstacle = (x, y) => {
//   const root = new window.DOMParser().parseFromString(TerrainData, 'image/svg+xml')
//   const paths = Array.prototype.slice.call(root.querySelectorAll('path'))
//   const vertexSets = paths.map(path => Svg.pathToVertices(path, 30))
//   return Bodies.fromVertices(
//     x,
//     y,
//     vertexSets,
//     {
//       isStatic: true,
//       render: {
//         fillStyle: '#630',
//         strokeStyle: '#666',
//         lineWidth: 1,
//       },
//       label: 'Obstacle',
//       texture: Texture.generate(obstacleTextureDef),
//       scent: Scent.generate(obstacleScentDef),
//     },
//     true,
//   )
// }

const simpleObstacle = (world: World, x: number, y: number) => {
  const vertices = [
    Vec2(0, -50),
    // Vec2(100, -40),
    Vec2(200, 40),
    Vec2(400, 50),
    // Vec2(300, 0),
    // Vec2(400, -400),
    Vec2(0, -400),
  ]
  createObstacle(world, x, y, Polygon(vertices), '#6308', '#666F')
}

const circularObstacle = (world: World, x: number, y: number, r: number) => {
  createObstacle(world, x, y, Circle(r), '#6308', '#630F')
}

const createObstacle = (world: World, x: number, y: number, shape: Shape, fill: string, stroke: string) => {
  const body = world.createBody(Vec2(x, y)) as PerceptibleBody
  body.createFixture(shape)
  body.style.fill = fill
  body.style.stroke = stroke
  body.label = 'Obstacle'
  body.texture = Texture.generate(obstacleTextureDef)
  body.scent = Scent.generate(obstacleScentDef)
  return body
}

// const borderTextureDef = [
//   [0, 0.2], //smoothness
//   [8, 0.2], // temperature
//   [15.99, 0.2], // solidity
// ]
// const borderScentDef = [
//   [0, 0.2],
//   [0, 0.2],
//   [0, 0.2],
//   [0, 0.2],
// ]

const border = (world: World, x: number, y: number, dirX: number, dirY: number) => {
  const body = world.createBody(Vec2(x, y)) as PerceptibleBody
  body.createFixture(Edge(Vec2(0, 0), Vec2(dirX, dirY)))
  // body.style.fill = '#3338'
  body.style.stroke = '#ffff'
  body.label = 'Border'
  body.texture = Texture.generate(obstacleTextureDef)
  body.scent = Scent.generate(obstacleScentDef)
}
