import Attribute from './attribute'

export default class Texture extends Attribute {
  // Textures are [0 to 16):
  // - smoothness: smooth to rough
  // - temperature: cool to hot
  // - solidity: light liquid to hard solid
  static elementCount = 3
}
