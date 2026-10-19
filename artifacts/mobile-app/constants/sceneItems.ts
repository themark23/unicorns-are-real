import { ImageSourcePropType } from "react-native";
import { SceneId } from "@/constants/backgrounds";

export type ItemCategory =
  | "drink"      // tips back + drains when near a character
  | "eat"        // chomped away
  | "wand"       // magic spin + sparkle burst
  | "gem"        // floats up and glows
  | "love"       // bounces with hearts
  | "toy"        // bouncy play
  | "crown"      // snaps onto character's head
  | "accessory"; // snaps onto character's side

export interface SceneItemConfig {
  id: string;
  image: ImageSourcePropType;
  /** X as fraction of sceneWidth (0–1.3 for panoramic spread) */
  xFraction: number;
  /** Y as fraction of usable screen height (0–1) */
  yFraction: number;
  size: number;
  category: ItemCategory;
}

// ── Shared generic items (appear across multiple scenes) ──────────────────────
const ITEMS = {
  shell:    require("../assets/items/shell.png"),
  star:     require("../assets/items/star.png"),
  crystals: require("../assets/items/crystals.png"),
  icecream: require("../assets/items/icecream.png"),
  potion:   require("../assets/items/potion.png"),
  drink:    require("../assets/items/drink.png"),
  donut:    require("../assets/items/donut.png"),
  fries:    require("../assets/items/fries.png"),
  lollipop: require("../assets/items/lollipop.png"),
  treasure: require("../assets/items/treasure.png"),
};

// ── Beach-exclusive items ──────────────────────────────────────────────────────
const BEACH = {
  sand_dollar:   require("../assets/items/beach/sand_dollar.png"),
  conch:         require("../assets/items/beach/conch.png"),
  starfish_wand: require("../assets/items/beach/starfish_wand.png"),
  pearl_bubble:  require("../assets/items/beach/pearl_bubble.png"),
  bottle:        require("../assets/items/beach/bottle.png"),
  shell_comb:    require("../assets/items/beach/shell_comb.png"),
  coral_crown:   require("../assets/items/beach/coral_crown.png"),
  tide_pool:     require("../assets/items/beach/tide_pool.png"),
  shell_heart:   require("../assets/items/beach/shell_heart.png"),
  jellyfish:     require("../assets/items/beach/jellyfish.png"),
};

export const SCENE_ITEMS: Record<SceneId, SceneItemConfig[]> = {
  // ── Sparkle Beach — 10 unique themed items ──────────────────────────────────
  beach: [
    { id: "sand_dollar",   image: BEACH.sand_dollar,   xFraction: 0.05, yFraction: 0.70, size: 68,  category: "toy" },
    { id: "conch",         image: BEACH.conch,         xFraction: 0.18, yFraction: 0.63, size: 72,  category: "toy" },
    { id: "starfish_wand", image: BEACH.starfish_wand, xFraction: 0.30, yFraction: 0.55, size: 72,  category: "wand" },
    { id: "pearl_bubble",  image: BEACH.pearl_bubble,  xFraction: 0.44, yFraction: 0.57, size: 70,  category: "toy" },
    { id: "bottle",        image: BEACH.bottle,        xFraction: 0.56, yFraction: 0.61, size: 68,  category: "drink" },
    { id: "shell_comb",    image: BEACH.shell_comb,    xFraction: 0.67, yFraction: 0.65, size: 66,  category: "accessory" },
    { id: "coral_crown",   image: BEACH.coral_crown,   xFraction: 0.78, yFraction: 0.60, size: 74,  category: "crown" },
    { id: "tide_pool",     image: BEACH.tide_pool,     xFraction: 0.89, yFraction: 0.67, size: 80,  category: "toy" },
    { id: "shell_heart",   image: BEACH.shell_heart,   xFraction: 1.00, yFraction: 0.62, size: 68,  category: "love" },
    { id: "jellyfish",     image: BEACH.jellyfish,     xFraction: 1.12, yFraction: 0.48, size: 74,  category: "toy" },
  ],

  // ── Magic Garden — 10 items ──────────────────────────────────────────────────
  garden: [
    { id: "crystals",     image: ITEMS.crystals, xFraction: 0.05, yFraction: 0.60, size: 74, category: "gem" },
    { id: "star",         image: ITEMS.star,     xFraction: 0.18, yFraction: 0.52, size: 60, category: "wand" },
    { id: "donut",        image: ITEMS.donut,    xFraction: 0.29, yFraction: 0.58, size: 66, category: "eat" },
    { id: "drink",        image: ITEMS.drink,    xFraction: 0.41, yFraction: 0.55, size: 64, category: "drink" },
    { id: "potion",       image: ITEMS.potion,   xFraction: 0.53, yFraction: 0.62, size: 62, category: "drink" },
    { id: "icecream",     image: ITEMS.icecream, xFraction: 0.64, yFraction: 0.59, size: 68, category: "eat" },
    { id: "lollipop",     image: ITEMS.lollipop, xFraction: 0.75, yFraction: 0.57, size: 68, category: "eat" },
    { id: "fries",        image: ITEMS.fries,    xFraction: 0.87, yFraction: 0.62, size: 68, category: "eat" },
    { id: "shell",        image: ITEMS.shell,    xFraction: 0.98, yFraction: 0.64, size: 72, category: "toy" },
    { id: "treasure",     image: ITEMS.treasure, xFraction: 1.10, yFraction: 0.60, size: 76, category: "gem" },
  ],

  // ── Rainbow Space — 10 items ─────────────────────────────────────────────────
  space: [
    { id: "star",         image: ITEMS.star,     xFraction: 0.06, yFraction: 0.52, size: 66, category: "wand" },
    { id: "crystals",     image: ITEMS.crystals, xFraction: 0.18, yFraction: 0.62, size: 74, category: "gem" },
    { id: "potion",       image: ITEMS.potion,   xFraction: 0.29, yFraction: 0.58, size: 62, category: "drink" },
    { id: "icecream",     image: ITEMS.icecream, xFraction: 0.41, yFraction: 0.55, size: 68, category: "eat" },
    { id: "treasure",     image: ITEMS.treasure, xFraction: 0.53, yFraction: 0.63, size: 76, category: "gem" },
    { id: "fries",        image: ITEMS.fries,    xFraction: 0.65, yFraction: 0.57, size: 68, category: "eat" },
    { id: "lollipop",     image: ITEMS.lollipop, xFraction: 0.76, yFraction: 0.53, size: 68, category: "eat" },
    { id: "drink",        image: ITEMS.drink,    xFraction: 0.87, yFraction: 0.60, size: 64, category: "drink" },
    { id: "donut",        image: ITEMS.donut,    xFraction: 0.98, yFraction: 0.57, size: 66, category: "eat" },
    { id: "shell",        image: ITEMS.shell,    xFraction: 1.12, yFraction: 0.62, size: 72, category: "toy" },
  ],

  // ── Crystal Forest — 10 items ────────────────────────────────────────────────
  forest: [
    { id: "crystals",     image: ITEMS.crystals, xFraction: 0.05, yFraction: 0.65, size: 76, category: "gem" },
    { id: "star",         image: ITEMS.star,     xFraction: 0.17, yFraction: 0.56, size: 60, category: "wand" },
    { id: "potion",       image: ITEMS.potion,   xFraction: 0.28, yFraction: 0.62, size: 62, category: "drink" },
    { id: "fries",        image: ITEMS.fries,    xFraction: 0.40, yFraction: 0.59, size: 68, category: "eat" },
    { id: "drink",        image: ITEMS.drink,    xFraction: 0.51, yFraction: 0.57, size: 64, category: "drink" },
    { id: "donut",        image: ITEMS.donut,    xFraction: 0.63, yFraction: 0.63, size: 66, category: "eat" },
    { id: "lollipop",     image: ITEMS.lollipop, xFraction: 0.74, yFraction: 0.58, size: 68, category: "eat" },
    { id: "icecream",     image: ITEMS.icecream, xFraction: 0.85, yFraction: 0.62, size: 68, category: "eat" },
    { id: "treasure",     image: ITEMS.treasure, xFraction: 0.97, yFraction: 0.66, size: 76, category: "gem" },
    { id: "shell",        image: ITEMS.shell,    xFraction: 1.10, yFraction: 0.60, size: 72, category: "toy" },
  ],

  // ── Fairy Park — 10 items ────────────────────────────────────────────────────
  park: [
    { id: "lollipop",     image: ITEMS.lollipop, xFraction: 0.06, yFraction: 0.62, size: 68, category: "eat" },
    { id: "icecream",     image: ITEMS.icecream, xFraction: 0.17, yFraction: 0.59, size: 68, category: "eat" },
    { id: "star",         image: ITEMS.star,     xFraction: 0.28, yFraction: 0.54, size: 60, category: "wand" },
    { id: "drink",        image: ITEMS.drink,    xFraction: 0.40, yFraction: 0.57, size: 64, category: "drink" },
    { id: "shell",        image: ITEMS.shell,    xFraction: 0.51, yFraction: 0.62, size: 72, category: "toy" },
    { id: "donut",        image: ITEMS.donut,    xFraction: 0.63, yFraction: 0.59, size: 66, category: "eat" },
    { id: "crystals",     image: ITEMS.crystals, xFraction: 0.74, yFraction: 0.60, size: 74, category: "gem" },
    { id: "potion",       image: ITEMS.potion,   xFraction: 0.85, yFraction: 0.63, size: 62, category: "drink" },
    { id: "fries",        image: ITEMS.fries,    xFraction: 0.97, yFraction: 0.58, size: 68, category: "eat" },
    { id: "treasure",     image: ITEMS.treasure, xFraction: 1.10, yFraction: 0.64, size: 76, category: "gem" },
  ],

  // ── Star Castle — 10 items ───────────────────────────────────────────────────
  castle: [
    { id: "treasure",     image: ITEMS.treasure, xFraction: 0.05, yFraction: 0.65, size: 76, category: "gem" },
    { id: "crystals",     image: ITEMS.crystals, xFraction: 0.17, yFraction: 0.63, size: 74, category: "gem" },
    { id: "star",         image: ITEMS.star,     xFraction: 0.28, yFraction: 0.52, size: 60, category: "wand" },
    { id: "potion",       image: ITEMS.potion,   xFraction: 0.40, yFraction: 0.61, size: 62, category: "drink" },
    { id: "icecream",     image: ITEMS.icecream, xFraction: 0.52, yFraction: 0.59, size: 68, category: "eat" },
    { id: "shell",        image: ITEMS.shell,    xFraction: 0.63, yFraction: 0.64, size: 72, category: "toy" },
    { id: "donut",        image: ITEMS.donut,    xFraction: 0.74, yFraction: 0.60, size: 66, category: "eat" },
    { id: "drink",        image: ITEMS.drink,    xFraction: 0.85, yFraction: 0.57, size: 64, category: "drink" },
    { id: "lollipop",     image: ITEMS.lollipop, xFraction: 0.97, yFraction: 0.62, size: 68, category: "eat" },
    { id: "fries",        image: ITEMS.fries,    xFraction: 1.10, yFraction: 0.58, size: 68, category: "eat" },
  ],
};
