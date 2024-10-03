import mixpanel from 'mixpanel-browser'

type EventName = 'Page Load' | 'Challenge Load' | 'Challenge Save' | 'Challenge Completion'
interface EventOptions {
  viewPortHeight?: number
  viewPortWidth?: number
  challengeName?: string
  error?: boolean
}

const debug = true
export default class Mixpanel {
  constructor(guid: string) {
    if (import.meta.env.MODE !== 'production') {
      if (debug) {
        console.log('Mixpanel disabled')
        return
      }
    }

    mixpanel.init(import.meta.env.VITE_MP_TK, { debug, persistence: 'localStorage' })
    mixpanel.identify(guid)
    this.track('Page Load', {
      viewPortWidth: window.visualViewport?.width,
      viewPortHeight: window.visualViewport?.height,
    })
  }

  track(eventName: EventName, opts: EventOptions = {}) {
    if (import.meta.env.MODE !== 'production') return

    mixpanel.track(eventName, { mode: import.meta.env.MODE, ...opts })
  }
}
