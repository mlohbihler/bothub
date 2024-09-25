import { Circle, Edge, Polygon, Shape, Vec2, World } from 'planck'
import Physiology from './physiology'
import { IEnvironment, PerceptibleBody, StepEvent, Steppable } from '../../@types'
import Controller from '../controller'

export default class Environment implements IEnvironment {
  updatables: Steppable[] = []
  agent

  constructor(world: World, controller: Controller) {
    // Obstacles
    //       // svgObstacle(600, 600),
    // simpleObstacle(world, 600, 1000)
    // circularObstacle(world, 500, 600, 100)
    // circularObstacle(world, 700, 600, 500)

    // border(world, 0, 0, 0, 1600)
    // border(world, 0, 1600, 1600, 0)
    // border(world, 1600, 1600, 0, -1600)
    // border(world, 1600, 0, -1600, 0)

    // // Updatables
    const agent = new Physiology(world, controller)
    this.agent = agent
    this.updatables.push(agent)
  }

  getAgent() {
    return this.agent
  }

  step(evt: StepEvent) {
    this.updatables.forEach(e => e.step(evt))
    this.renderGoal(evt)
  }

  renderGoal(evt: StepEvent) {
    if (evt.keyEvents.length) {
      // TODO: disable the goal
    }

    const radius = Math.sin(evt.timestamp * 3) * 4
    evt.debugHelper.circle(300, 0, radius + 30, 'yellow', 1.5)
    // evt.debugHelper.circle(300, 0, ((evt.step + 30) % 60) / 2 + 30, `#f00${}`)
  }
}

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
  return body
}

const border = (world: World, x: number, y: number, dirX: number, dirY: number) => {
  const body = world.createBody(Vec2(x, y)) as PerceptibleBody
  body.createFixture(Edge(Vec2(0, 0), Vec2(dirX, dirY)))
  // body.style.fill = '#3338'
  body.style.stroke = '#ffff'
  body.label = 'Border'
}
