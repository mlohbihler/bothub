import Bracizza from './bracizza'
import Digizza from './digizza'
import Edible from './edible'
import Lamizza from './lamizza'
import Reyzza from './reyzza'
import Sugazza from './sugazza'
import Water from './water'

export default class Edibles {
  static foodSuffix = 'zza'

  static edibleClasses: Map<string, typeof Edible> = new Map([
    [Bracizza.name, Bracizza],
    [Digizza.name, Digizza],
    [Lamizza.name, Lamizza],
    [Reyzza.name, Reyzza],
    [Sugazza.name, Sugazza],
    [Water.name, Water],
  ])

  static resourceAmountsForType(edibleType?: string) {
    return edibleType ? this.edibleClasses.get(edibleType)?.resourceAmounts : undefined
  }
}
