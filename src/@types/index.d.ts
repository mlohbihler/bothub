import { Body, BodyDef, Vec2 } from 'planck'
import { AttributeValue } from '../goid/environment/attributes/attribute'
import { DebugHelper } from '../util'

// declare module '*.svg' {
//   const content: string
//   export default content
// }

declare global {
  interface Window {
    GID: any
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
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
