export type IdleType = "float" | "stumble" | "hop" | "trip" | "sway";

export interface CharacterConfig {
  id: string;
  /** Short name used in accessibility labels and UI copy */
  name: string;
  /** Full display name e.g. "Mama Celestia" */
  displayName: string;
  /** Rendered image width in dp. Height = size × 1.33 (3:4 sprite aspect ratio). */
  size: number;
  bodyColor: string;
  glowColor: string;
  sparkleColor: string;
  idleType: IdleType;
  /** X initial position as a fraction of (screenWidth − size).
   *  Laid out as two staggered rows — parents behind, children in front — so
   *  the whole family can be on screen at once without overlapping. */
  initialXFraction: number;
  /** Y initial position as a fraction of usable vertical space */
  initialYFraction: number;
}

const BASE_SIZE = 80;

export const CHARACTERS: CharacterConfig[] = [
  {
    id: "mama-celestia",
    name: "Celestia",
    displayName: "Mama Celestia",
    size: Math.round(BASE_SIZE * 1.35),   // ~108
    bodyColor: "#FFD1C2",
    glowColor: "#FFB6D9",
    sparkleColor: "#FFD86B",
    idleType: "float",
    initialXFraction: 0.02,
    initialYFraction: 0.42,
  },
  {
    id: "papa-orion",
    name: "Orion",
    displayName: "Papa Orion",
    size: Math.round(BASE_SIZE * 1.4),    // ~112
    bodyColor: "#5B2BBF",
    glowColor: "#A348FF",
    sparkleColor: "#DDE2EE",
    idleType: "stumble",
    initialXFraction: 0.68,
    initialYFraction: 0.4,
  },
  {
    id: "daughter-lumi",
    name: "Lumi",
    displayName: "Daughter Lumi",
    size: Math.round(BASE_SIZE * 1.0),    // 80
    bodyColor: "#FF9CFE",
    glowColor: "#FF9CFE",
    sparkleColor: "#8FE9F7",
    idleType: "hop",
    initialXFraction: 0.4,
    initialYFraction: 0.76,
  },
  {
    id: "son-comet",
    name: "Comet",
    displayName: "Son Comet",
    size: Math.round(BASE_SIZE * 0.85),   // ~68
    bodyColor: "#B7F2D9",
    glowColor: "#FFE36B",
    sparkleColor: "#FFD54D",
    idleType: "trip",
    initialXFraction: 0.8,
    initialYFraction: 0.82,
  },
  {
    id: "baby-twinkle",
    name: "Twinkle",
    displayName: "Baby Twinkle",
    size: Math.round(BASE_SIZE * 1.05),   // ~84
    bodyColor: "#FFEAA1",
    glowColor: "#FFD6E6",
    sparkleColor: "#FFD65A",
    idleType: "sway",
    initialXFraction: 0.1,
    initialYFraction: 0.8,
  },
];
