import { Body, BodyDef, Vec2, World } from 'planck'
import { AttributeValue } from '../goid/environment/attributes/attribute'
import { DebugHelper } from '../util'
import Environment from '../challenges/001-forward/environment'
import Controller from '../challenges/controller'

// declare module '*.svg' {
//   const content: string
//   export default content
// }

declare global {
  interface Window {
    GID: any
  }
}

interface StepEvent {
  step: number
  timestamp: number
  keyEvents: KeyboardEvent[]
  debugRenderers: ((h: DebugHelper) => void)[]
  debugProps: DebugProps

  // Testing
  position?: Vec2
  angle?: number
  debugHelper: DebugHelper
}

interface DebugProps {
  [key: string]: any
}

interface Steppable {
  step: (evt: StepEvent) => void
}

interface PerceptibleBodyData {
  texture: AttributeValue
  scent: AttributeValue
  label?: string
}
interface PerceptibleBody extends Body, PerceptibleBodyData {}
interface PerceptibleBodyDef extends BodyDef, PerceptibleBodyData {}

class IEnvironment {
  step(evt: StepEvent): void
}
// class IChallenge {
//   static getLabel(): string
//   static getName(): string
//   getHint(): string
//   createEnvironment(): Environment
//   getWorld(): World
//   getEnvironment(): Environment
//   getRendererOptions(): Partial<RendererOptions>
//   reset(): void
// }

class ISensors {}

class IActuators {
  clear(): void
}

type KeyHandlerFunction = (actuators: IActuators, evt: KeyboardEvent) => void
type KeyHandlerAction = 'repeat' | 'debounce'
interface KeyHandler {
  keyCode: string
  action: KeyHandlerAction
  run: KeyHandlerFunction
}

interface SetupOptions {
  keyHandlers: KeyHandler[]
}
