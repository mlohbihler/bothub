import Modal from './modal'
import Challenge from './challenges/challenge'
import { IEnvironment } from './@types'

// @ts-ignore
import GenericInfo from './assets/genericInfo.html?raw'

export default class InfoModal extends Modal {
  constructor() {
    super('infoModalVeil', 'infoModalContent', 'infoModalClose')
  }

  showChallenge(challenge: Challenge<IEnvironment>) {
    const content = `${challenge.getInfo()}${GenericInfo}`
    this.contentElement.innerHTML = content

    super.show()
  }
}
