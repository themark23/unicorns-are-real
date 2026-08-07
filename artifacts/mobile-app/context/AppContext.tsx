import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ImageSourcePropType } from "react-native";
import { SharedValue, useSharedValue } from "react-native-reanimated";

import { setSfxEnabled } from "@/utils/sfx";

const STORE_KEY = "@unicorn_valley_state";

export type Scene = "beach" | "garden" | "space" | "forest" | "park" | "castle";

/** A scene item that has been attached as a worn accessory on a character */
export interface WornItemDef {
  id: string;
  image: ImageSourcePropType;
  size: number;
  category: "crown" | "accessory";
}

/** Scene-space bounding rect for a character, kept in a SharedValue for worklet access */
export type CharRect = { x: number; y: number; w: number; h: number };

const ALL_CHARACTER_IDS = [
  "mama-celestia",
  "papa-orion",
  "daughter-lumi",
  "son-comet",
  "baby-twinkle",
] as const;

interface AppContextValue {
  currentScene: Scene;
  setScene: (s: Scene) => void;
  /** Characters currently placed in the scene */
  activeCharacters: string[];
  toggleCharacter: (id: string) => void;
  isCharacterActive: (id: string) => boolean;
  /** Z-order management */
  charOrder: string[];
  bringToFront: (id: string) => void;
  getZIndex: (id: string) => number;
  resetKey: number;
  triggerReset: () => void;
  sceneOffsetX: SharedValue<number>;
  activeDrags: SharedValue<number>;
  /** Character bounding rects in scene space — readable from worklets */
  charRects: SharedValue<Record<string, CharRect>>;
  /** Items currently worn by each character */
  wornItems: Record<string, WornItemDef | null>;
  attachWornItem: (charId: string, item: WornItemDef) => void;
  removeWornItem: (charId: string) => void;
  /** Music and sound effects. Persisted, and respected by every audio path. */
  soundEnabled: boolean;
  toggleSound: () => void;
  /** Triggers a joy reaction on the named character (scale pulse + sparkle) */
  pendingReaction: { charId: string; type: string; tick: number };
  triggerReaction: (charId: string, type: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentScene, setCurrentScene] = useState<Scene>("beach");
  // Start with the whole family present. Starting empty meant a child opened
  // the app to a scene with nobody in it and no hint that the tray adds them.
  const [activeCharacters, setActiveCharacters] = useState<string[]>([...ALL_CHARACTER_IDS]);
  const [charOrder, setCharOrder] = useState<string[]>([...ALL_CHARACTER_IDS]);
  const [resetKey, setResetKey] = useState(0);
  const [wornItems, setWornItems] = useState<Record<string, WornItemDef | null>>({});
  const [pendingReaction, setPendingReaction] = useState({ charId: "", type: "", tick: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Don't write anything back until the saved state has been read, or the
  // defaults above would immediately overwrite it.
  const hydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORE_KEY)
      .then((raw) => {
        if (raw) {
          const s = JSON.parse(raw);
          if (typeof s?.currentScene === "string") setCurrentScene(s.currentScene);
          if (Array.isArray(s?.activeCharacters)) {
            const valid = s.activeCharacters.filter((id: string) =>
              (ALL_CHARACTER_IDS as readonly string[]).includes(id)
            );
            setActiveCharacters(valid);
          }
          if (typeof s?.soundEnabled === "boolean") setSoundEnabled(s.soundEnabled);
        }
      })
      .catch(() => {})
      .finally(() => { hydrated.current = true; });
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(
      STORE_KEY,
      JSON.stringify({ currentScene, activeCharacters, soundEnabled })
    ).catch(() => {});
  }, [currentScene, activeCharacters, soundEnabled]);

  const sceneOffsetX = useSharedValue(0);
  const activeDrags  = useSharedValue(0);
  const charRects    = useSharedValue<Record<string, CharRect>>({});

  const setScene = useCallback((s: Scene) => setCurrentScene(s), []);

  const toggleCharacter = useCallback((id: string) => {
    setActiveCharacters((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }, []);

  const isCharacterActive = useCallback(
    (id: string) => activeCharacters.includes(id),
    [activeCharacters]
  );

  const bringToFront = useCallback((id: string) => {
    setCharOrder((prev) => [...prev.filter((c) => c !== id), id]);
  }, []);

  const getZIndex = useCallback(
    (id: string) => charOrder.indexOf(id) + 1,
    [charOrder]
  );

  /* Puts the valley back how it started: scroll home, every consumed item
     restored (SceneProp is keyed on resetKey), and hats and crowns taken off.
     Nothing else in the app could undo any of that. */
  const triggerReset = useCallback(() => {
    setWornItems({});
    setResetKey((k) => k + 1);
  }, []);

  const attachWornItem = useCallback((charId: string, item: WornItemDef) => {
    setWornItems((prev) => ({ ...prev, [charId]: item }));
  }, []);

  const removeWornItem = useCallback((charId: string) => {
    setWornItems((prev) => ({ ...prev, [charId]: null }));
  }, []);

  const toggleSound = useCallback(() => setSoundEnabled((s) => !s), []);

  // Keep the sfx module (called from plain callbacks) in step with the flag.
  useEffect(() => { setSfxEnabled(soundEnabled); }, [soundEnabled]);

  const triggerReaction = useCallback((charId: string, type: string) => {
    setPendingReaction((prev) => ({ charId, type, tick: prev.tick + 1 }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentScene,
        setScene,
        activeCharacters,
        toggleCharacter,
        isCharacterActive,
        charOrder,
        bringToFront,
        getZIndex,
        resetKey,
        triggerReset,
        sceneOffsetX,
        activeDrags,
        charRects,
        wornItems,
        attachWornItem,
        removeWornItem,
        soundEnabled,
        toggleSound,
        pendingReaction,
        triggerReaction,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
