import { basicSetup } from 'codemirror'
import { javascript, esLint } from '@codemirror/lang-javascript'
import { linter, lintGutter } from '@codemirror/lint'
import { indentLess, indentMore } from '@codemirror/commands'
import { Prec } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import * as eslint from 'eslint-linter-browserify'
import mixpanel from 'mixpanel-browser'

import { createElement, getContext, getRequiredElementById } from './util'
import Renderer from './planck/renderer'
import { FPS } from './planck/boxUtil'
import Runner from './runner'
import Challenge from './challenges/challenge'
import ErrorMessage from './errorMessage'
import InfoModal from './infoModal'
import ConfigModal from './configModal'
import gid from './gid'
import { IEnvironment } from './@types'

import Forward from './challenges/001-forward'
import Turn from './challenges/002-turn'
import Gradient from './challenges/003-gradient'
import PathIntegration from './challenges/004-pathIntegration'
import Gradient2 from './challenges/005-gradient2'

// @ts-ignore
import PlayButton from './assets/svg/fa-play.svg?raw'
// @ts-ignore
import PauseButton from './assets/svg/fa-pause.svg?raw'
// @ts-ignore
import ForwardStepButton from './assets/svg/fa-forward-step.svg?raw'
// @ts-ignore
import BackwardButton from './assets/svg/fa-backward-fast.svg?raw'
// @ts-ignore
import MouseIcon from './assets/svg/fa-arrow-pointer.svg?raw'
// @ts-ignore
import GearButton from './assets/svg/fa-gear.svg?raw'
// @ts-ignore
import InfoButton from './assets/svg/fa-info.svg?raw'
// @ts-ignore
import NextButton from './assets/svg/fa-forward-fast.svg?raw'

// TODO: don't allow changing challenge to beyond what has already been completed until the basics are done.

interface Config {
  guid?: string
  challengeName?: string
  showMousePosition: boolean
  indentOnTab: boolean
}
const defaultConfig: Config = {
  showMousePosition: false,
  indentOnTab: true,
}

type EventName = 'Page Load' | 'Challenge Load' | 'Challenge Save' | 'Challenge Completion'
interface EventOptions {
  viewPortHeight?: number
  viewPortWidth?: number
  challengeName?: string
  error?: boolean
}

const STEP_TIME = 1 / FPS
const LOCAL_STORAGE_CONFIG_KEY = 'gid-config'

let challenges: (typeof Challenge<IEnvironment>)[]
let config: Config
let editorView: EditorView
let errorMessage: ErrorMessage
let infoModal: InfoModal
let configModal: ConfigModal
let challenge: Challenge<IEnvironment>
let runner: Runner
let renderer: Renderer

window.onload = () => {
  window.GID = gid

  initChallenges()
  initEditor()
  const canvas = initCanvas()
  errorMessage = new ErrorMessage('codeError', 'codeErrorContent', 'codeErrorClose')
  infoModal = new InfoModal()
  configModal = new ConfigModal()
  initButtons()
  initConfig()
  mouseListeners(canvas)
  initMP()

  setChallenge()
}

// TODO
// window.onerror = evt => {}

const initMP = () => {
  mixpanel.init(import.meta.env.VITE_MP_TK, { debug: true, persistence: 'localStorage' })
  mixpanel.identify(config.guid)
  track('Page Load', { viewPortWidth: window.visualViewport?.width, viewPortHeight: window.visualViewport?.height })
}

const track = (eventName: EventName, opts: EventOptions = {}) => {
  mixpanel.track(eventName, { mode: import.meta.env.MODE, ...opts })
}

const initChallenges = () => {
  challenges = [Forward, Turn, Gradient, PathIntegration, Gradient2]
}

const localStorageName = (challenge: Challenge<IEnvironment>) =>
  `gid-script-${(challenge.constructor as typeof Challenge).getName()}`

const initEditor = () => {
  const saveAndRun = (reset: boolean) => {
    updateScript()
    if (reset) resetChallenge()
    // Always return true so that the browser save dialog is not raised.
    return true
  }

  const maybeIndentMore = (target: EditorView) => (config.indentOnTab ? indentMore(target) : false)
  const maybeIndentLess = (target: EditorView) => (config.indentOnTab ? indentLess(target) : false)

  const keys = Prec.highest(
    keymap.of([
      { key: 'Mod-s', run: () => saveAndRun(true) },
      { key: 'Shift-Mod-s', run: () => saveAndRun(false) },
      { key: 'Tab', run: maybeIndentMore },
      { key: 'Shift-Tab', run: maybeIndentLess },
    ]),
  )
  editorView = new EditorView({
    doc: `// Your code goes here`,
    extensions: [
      basicSetup, //
      keys,
      javascript(),
      lintGutter(),
      linter(esLint(new eslint.Linter(), {})),
    ],
    parent: getRequiredElementById('codeEditor'),
  })
}

const updateScript = () => {
  const script = editorView.state.doc.toString()

  let error = false
  try {
    // Tell the challenge about the new code.
    challenge.saveScript(script)
    errorMessage.hide()
  } catch (e) {
    errorMessage.show(e)
    error = true
  }
  track('Challenge Save', { challengeName: challenge.getName(), error })

  // Save the code in local memory.
  // TODO: handle scripts that are too large for local?
  localStorage.setItem(localStorageName(challenge), script)
}

const initCanvas = () => {
  const canvas = getRequiredElementById('canvas') as HTMLCanvasElement
  const canvasContainer = getRequiredElementById('canvasContainer')

  // Have the canvas resize to fit the container.
  const observer = new ResizeObserver(entries => {
    entries.forEach(e => {
      canvas.width = e.contentRect.width
      canvas.height = e.contentRect.height // - 10
    })
  })
  observer.observe(canvasContainer)

  keyboardListeners(canvasContainer)

  return canvas
}

const initButtons = () => {
  const buttons = getRequiredElementById('buttons')
  createElement(buttons, BackwardButton, { id: 'resetButton', ariaLabel: 'reset' }).addEventListener(
    'click',
    resetChallenge,
  )
  createElement(buttons, PauseButton, { id: 'pauseButton' }).addEventListener('click', toggleRunner)
  createElement(buttons, PlayButton, { id: 'playButton' }).addEventListener('click', toggleRunner)
  createElement(buttons, ForwardStepButton, { id: 'stepButton' }).addEventListener('click', tick)
  fixButtons()

  createElement(getRequiredElementById('mouseIcon'), MouseIcon)

  const help = getRequiredElementById('help')
  createElement(help, GearButton, { id: 'gearButton' }).addEventListener('click', () => configModal.show())
  createElement(help, InfoButton, { id: 'infoButton' }).addEventListener('click', () =>
    infoModal.showChallenge(challenge),
  )

  createElement(getRequiredElementById('nextChallengeIcon'), NextButton)
  getRequiredElementById('nextChallenge').addEventListener('click', setNextChallenge)
}

const initConfig = () => {
  config = { ...defaultConfig, ...JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY) || '{}') }
  if (!config.guid) saveConfig({ guid: crypto.randomUUID() })

  const mousePosition = getRequiredElementById('mousePositionsContainer')
  mousePosition.style.display = config.showMousePosition ? '' : 'none'
  const mousePositionCheckbox = getRequiredElementById('mousePositionCheckbox') as HTMLInputElement
  mousePositionCheckbox.checked = config.showMousePosition
  mousePositionCheckbox.addEventListener('change', evt => {
    const value = (evt.target as HTMLInputElement)?.checked
    mousePosition.style.display = value ? '' : 'none'
    saveConfig({ showMousePosition: value })
  })

  const indentOnTabCheckbox = getRequiredElementById('indentOnTabCheckbox') as HTMLInputElement
  indentOnTabCheckbox.checked = config.indentOnTab
  indentOnTabCheckbox.addEventListener('change', evt => {
    const value = (evt.target as HTMLInputElement)?.checked
    saveConfig({ indentOnTab: value })
  })

  const challengeSelect = getRequiredElementById('challengeSelect') as HTMLSelectElement
  challenges.forEach(c => challengeSelect.options.add(new Option(c.getLabel(), c.getName())))
  challengeSelect.addEventListener('change', evt =>
    setChallenge(challenges.find(c => c.getName() === (evt.target as HTMLSelectElement)?.selectedOptions[0].value)),
  )
}

const saveConfig = (update: Partial<Config>) => {
  config = { ...config, ...update }
  localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(config))
}

const resetChallenge = () => {
  challenge.reset()
  renderer.recenter()
  runner.reset()
  challengeCompleteAnimation?.stop()
}

const mouseListeners = (canvas: HTMLCanvasElement) => {
  canvas.addEventListener('mousemove', evt => {
    const canvasCoords = renderer.offsetToCanvas(evt.offsetX, evt.offsetY)
    getRequiredElementById('canvasMousePosition').textContent = `${Math.round(canvasCoords.x)}, ${Math.round(
      canvasCoords.y,
    )}`
    const worldCoords = renderer.offsetToWorld(evt.offsetX, evt.offsetY)
    getRequiredElementById('worldMousePosition').textContent = `${worldCoords.x.toFixed(2)}, ${worldCoords.y.toFixed(
      2,
    )}`
    if (evt.buttons === 1) {
      renderer.moveOffset(evt.movementX, evt.movementY)
      if (!runner.running()) {
        // Too much flashing going on when the running is also refreshing
        runner.render()
      }
    }
  })

  canvas.addEventListener('mouseleave', () => {
    getRequiredElementById('canvasMousePosition').textContent = ''
    getRequiredElementById('worldMousePosition').textContent = ' '
  })

  canvas.addEventListener('wheel', evt => {
    renderer.zoom(evt.deltaY > 0, evt.offsetX, evt.offsetY)
    if (!runner.running()) {
      // Too much flashing going on when the running is also refreshing
      runner.render()
    }
  })
}

const keyboardListeners = (canvas: HTMLElement) => {
  canvas.addEventListener('keydown', evt => runner.addKeyEvent(evt))
  canvas.addEventListener('keyup', evt => runner.addKeyEvent(evt))
}

export const toggleRunner = function () {
  if (runner.running()) {
    runner.stop()
  } else {
    runner.start()
  }
  fixButtons()
}

export const tick = () => {
  if (!runner?.running()) {
    runner.tick()
  }
}

const fixButtons = () => {
  if (runner?.running()) {
    getRequiredElementById('pauseButton').style.display = ''
    getRequiredElementById('playButton').style.display = 'none'
    getRequiredElementById('stepButton').classList.add('disabled')
  } else {
    getRequiredElementById('pauseButton').style.display = 'none'
    getRequiredElementById('playButton').style.display = ''
    getRequiredElementById('stepButton').classList.remove('disabled')
  }
}

let challengeCompleteAnimation: ChallengeCompleteAnimation | undefined
const challengeComplete = () => {
  if (!challengeCompleteAnimation) {
    challengeCompleteAnimation = new ChallengeCompleteAnimation()
    track('Challenge Completion', { challengeName: challenge.getName() })
  }
}

class ChallengeCompleteAnimation {
  veilOpacity = 0
  timeout: NodeJS.Timeout | undefined

  constructor() {
    this.setOpacity()
    this.setVisibility('visible')
    this.start()
  }

  start() {
    this.timeout = setTimeout(() => this.animate(), 50)
  }

  animate() {
    this.veilOpacity += 0.04
    this.setOpacity()
    if (this.veilOpacity < 1) {
      this.start()
    } else {
      runner.stop()
      fixButtons()
    }
  }

  setOpacity(value = this.veilOpacity) {
    getRequiredElementById('canvasVeil').style.opacity = value.toString()
  }

  setVisibility(value: 'visible' | 'hidden') {
    getRequiredElementById('canvasVeil').style.visibility = value
  }

  stop() {
    this.setOpacity(0)
    clearTimeout(this.timeout)
    this.setVisibility('hidden')
    challengeCompleteAnimation = undefined
  }
}

// const isLastChallenge = () => {
//   if (challenge) {
//     return challenge.constructor === challenges[challenges.length - 1]
//   }
//   return false
// }
const setNextChallenge = () => {
  let nextChallengeClass
  if (challenge) {
    let currentIndex = challenges.findIndex(c => c === challenge.constructor)
    if (currentIndex < challenges.length - 1) {
      nextChallengeClass = challenges[currentIndex + 1]
    } else {
      // TODO: no next challenge. Display a done message. Or, link to the vscode plugin.
    }
  } else {
    nextChallengeClass = challenges[0]
  }

  setChallenge(nextChallengeClass)
}
const setChallenge = (clazz?: typeof Challenge<IEnvironment>) => {
  if (!clazz) {
    clazz = challenges.find(c => c.getName() === config.challengeName)
    if (!clazz) {
      clazz = challenges[0]
    }
  }

  if (challenge?.constructor === clazz) {
    return
  }

  challenge = new clazz()
  getRequiredElementById('challengeName').innerText = challenge.getLabel()
  const select = getRequiredElementById('challengeSelect') as HTMLSelectElement
  select.options.selectedIndex = challenges.findIndex(c => c === clazz)
  saveConfig({ challengeName: clazz.getName() })

  editorView.dispatch({
    changes: {
      from: 0,
      to: editorView.state.doc.length,
      insert: localStorage.getItem(localStorageName(challenge)) || challenge.getHint(),
    },
  })
  updateScript()

  runner?.stop()
  challengeCompleteAnimation?.stop()

  // Define the renderer
  renderer = new Renderer(
    getContext(getRequiredElementById('canvas') as HTMLCanvasElement) as CanvasRenderingContext2D,
    challenge.getRendererOptions(),
  )

  runner = new Runner(
    challenge,
    renderer,
    STEP_TIME,
    getRequiredElementById('debugProps'),
    errorMessage,
    toggleRunner,
    challengeComplete,
  )
  toggleRunner()
  track('Challenge Load', { challengeName: challenge.getName() })
}
