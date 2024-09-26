import { createElement, getContext, getRequiredElementById } from './util'
import Renderer from './planck/renderer'
import { FPS } from './planck/boxUtil'
import Forward from './challenges/001-forward'
import { basicSetup } from 'codemirror'
import { javascript, esLint } from '@codemirror/lang-javascript'
import { linter, lintGutter } from '@codemirror/lint'
import { Prec } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import Runner from './runner'
import Challenge from './challenges/challenge'
import * as eslint from 'eslint-linter-browserify'
import ErrorMessage from './errorMessage'
import InfoModal from './infoModal'
// @ts-ignore
import PlayButton from './assets/svg/fa-play.svg?raw'
// @ts-ignore
import PauseButton from './assets/svg/fa-pause.svg?raw'
// @ts-ignore
import ForwardStepButton from './assets/svg/fa-forward-step.svg?raw'
// @ts-ignore
import BackwardButton from './assets/svg/fa-backward.svg?raw'
// @ts-ignore
import GearButton from './assets/svg/fa-gear.svg?raw'
// @ts-ignore
import InfoButton from './assets/svg/fa-info.svg?raw'
import gid from './gid'
import { IEnvironment } from './@types'

const STEP_TIME = 1 / FPS

let editorView: EditorView
let errorMessage: ErrorMessage
let infoModal: InfoModal
let challenge: Challenge<IEnvironment>
let runner: Runner
let renderer: Renderer

window.onload = () => {
  window.GID = gid

  initEditor()
  const canvas = initCanvas()
  errorMessage = new ErrorMessage('codeError', 'codeErrorContent', 'codeErrorClose')
  infoModal = new InfoModal()
  initButtons()

  challenge = new Forward()
  editorView.dispatch({
    changes: {
      from: 0,
      to: editorView.state.doc.length,
      insert: localStorage.getItem(localStorageName(challenge)) || challenge.getHint(),
    },
  })
  updateScript()

  // Define the renderer
  const ctx = getContext(canvas) as CanvasRenderingContext2D
  renderer = new Renderer(ctx, challenge.getRendererOptions())

  runner = new Runner(challenge, renderer, STEP_TIME, getRequiredElementById('debugProps'), errorMessage, toggleRunner)
  toggleRunner()

  mouseListeners(canvas)
}

// @ts-ignore
const localStorageName = (challenge: Challenge) => `gid-script-${challenge.constructor.getName()}`

const initEditor = () => {
  const saveAndRun = () => {
    updateScript()
    // Always return true so that the browser save dialog is not raised.
    return true
  }

  const keys = Prec.highest(keymap.of([{ key: 'Mod-s', run: saveAndRun }]))
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

  try {
    // Tell the challenge about the new code.
    challenge.saveScript(script)
    errorMessage.hide()
  } catch (e) {
    errorMessage.show(e)
  }

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

  const help = getRequiredElementById('help')
  createElement(help, GearButton, { id: 'gearButton' }).addEventListener('click', () => alert('TODO'))
  createElement(help, InfoButton, { id: 'infoButton' }).addEventListener('click', () => infoModal.show(challenge))
}

const resetChallenge = () => {
  challenge.reset()
  runner.reset()
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
        renderer.render(challenge.getWorld())
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
      renderer.render(challenge.getWorld())
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
