import { ImageSourcePropType } from "react-native";

export type SceneId = "beach" | "garden" | "space" | "forest" | "park" | "castle";

export interface SceneBackground {
  id: SceneId;
  label: string;
  emoji: string;
  image: ImageSourcePropType;
  /** Dominant accent color for active ring / UI tints */
  accent: string;
}

export const BACKGROUNDS: SceneBackground[] = [
  {
    id: "beach",
    label: "Sparkle Beach",
    emoji: "🏖️",
    image: require("../assets/backgrounds/beach.png"),
    accent: "#7ACDE8",
  },
  {
    id: "garden",
    label: "Magic Garden",
    emoji: "🌸",
    image: require("../assets/backgrounds/garden.png"),
    accent: "#E8A0C8",
  },
  {
    id: "space",
    label: "Rainbow Space",
    emoji: "🔮",
    image: require("../assets/backgrounds/space.png"),
    accent: "#9B6FD4",
  },
  {
    id: "forest",
    label: "Crystal Forest",
    emoji: "🍄",
    image: require("../assets/backgrounds/forest.png"),
    accent: "#7BC47B",
  },
  {
    id: "park",
    label: "Fairy Park",
    emoji: "🦄",
    image: require("../assets/backgrounds/park.png"),
    accent: "#A8D878",
  },
  {
    id: "castle",
    label: "Star Castle",
    emoji: "🏰",
    image: require("../assets/backgrounds/castle.png"),
    accent: "#D4A0C8",
  },
];

export function getBackground(id: SceneId): SceneBackground {
  return BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[0];
}
