import { ImageSourcePropType } from "react-native";

// Static require() map — React Native needs literal paths at bundle time.
const IMAGES: Record<string, ImageSourcePropType> = {
  "mama-celestia": require("../assets/characters/celestia.png"),
  "papa-orion": require("../assets/characters/orion.png"),
  "daughter-lumi": require("../assets/characters/lumi.png"),
  "son-comet": require("../assets/characters/comet.png"),
  "baby-twinkle": require("../assets/characters/twinkle.png"),
};

export function getCharacterImage(id: string): ImageSourcePropType {
  return IMAGES[id] ?? IMAGES["mama-celestia"];
}
