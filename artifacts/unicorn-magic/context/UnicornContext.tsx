import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Zone = 'body' | 'mane' | 'horn' | 'tail';
type UnicornStyle = 'unicorn' | 'alicorn';
type Location = 'rainbow meadow' | 'enchanted forest' | 'crystal cave' | 'starry sky' | 'magical beach';

interface UnicornColors {
  body: string;
  mane: string;
  horn: string;
  tail: string;
}

interface PlacedAccessory {
  id: string;
  x: number;
  y: number;
}

const DEFAULT_COLORS: UnicornColors = {
  body: '#f0e4ff',
  mane: '#ff9de2',
  horn: '#ffd700',
  tail: '#c084fc',
};

const DEFAULT_PAINT_COLORS: UnicornColors = {
  body: '#ffffff',
  mane: '#ffffff',
  horn: '#ffffff',
  tail: '#ffffff',
};

interface UnicornContextType {
  dressColors: UnicornColors;
  sparkles: boolean;
  selectedZone: Zone | null;
  placedAccessories: PlacedAccessory[];
  paintColors: UnicornColors;
  activePaintColor: string;
  unicornStyle: UnicornStyle;
  paintLocation: Location;
  setDressColor: (zone: Zone, color: string) => void;
  toggleSparkles: () => void;
  setSelectedZone: (zone: Zone | null) => void;
  addPlacedAccessory: (accessory: PlacedAccessory) => void;
  removePlacedAccessory: (id: string) => void;
  clearPlacedAccessories: () => void;
  setPaintColor: (zone: Zone, color: string) => void;
  setActivePaintColor: (color: string) => void;
  resetDressColors: () => void;
  resetPaintColors: () => void;
  setUnicornStyle: (style: UnicornStyle) => void;
  setPaintLocation: (location: Location) => void;
}

const UnicornContext = createContext<UnicornContextType | null>(null);

export function UnicornProvider({ children }: { children: React.ReactNode }) {
  const [dressColors, setDressColors] = useState<UnicornColors>(DEFAULT_COLORS);
  const [sparkles, setSparkles] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>('body');
  const [placedAccessories, setPlacedAccessories] = useState<PlacedAccessory[]>([]);
  const [paintColors, setPaintColors] = useState<UnicornColors>(DEFAULT_PAINT_COLORS);
  const [activePaintColor, setActivePaintColor] = useState('#ff9de2');
  const [unicornStyle, setUnicornStyle] = useState<UnicornStyle>('unicorn');
  const [paintLocation, setPaintLocation] = useState<Location>('rainbow meadow');

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('unicorn-dress-colors');
        if (saved) setDressColors(JSON.parse(saved));
        const savedSparkles = await AsyncStorage.getItem('unicorn-sparkles');
        if (savedSparkles) setSparkles(JSON.parse(savedSparkles));
        const savedPaint = await AsyncStorage.getItem('unicorn-paint-colors');
        if (savedPaint) setPaintColors(JSON.parse(savedPaint));
      } catch (_) {}
    })();
  }, []);

  const setDressColor = useCallback(async (zone: Zone, color: string) => {
    setDressColors((prev) => {
      const next = { ...prev, [zone]: color };
      AsyncStorage.setItem('unicorn-dress-colors', JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const toggleSparkles = useCallback(() => {
    setSparkles((prev) => {
      const next = !prev;
      AsyncStorage.setItem('unicorn-sparkles', JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const addPlacedAccessory = useCallback((accessory: PlacedAccessory) => {
    setPlacedAccessories((prev) => {
      const filtered = prev.filter((a) => a.id !== accessory.id);
      return [...filtered, accessory];
    });
  }, []);

  const removePlacedAccessory = useCallback((id: string) => {
    setPlacedAccessories((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearPlacedAccessories = useCallback(() => setPlacedAccessories([]), []);

  const setPaintColor = useCallback(async (zone: Zone, color: string) => {
    setPaintColors((prev) => {
      const next = { ...prev, [zone]: color };
      AsyncStorage.setItem('unicorn-paint-colors', JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const resetDressColors = useCallback(async () => {
    setDressColors(DEFAULT_COLORS);
    setPlacedAccessories([]);
    await AsyncStorage.setItem('unicorn-dress-colors', JSON.stringify(DEFAULT_COLORS));
  }, []);

  const resetPaintColors = useCallback(() => {
    setPaintColors(DEFAULT_PAINT_COLORS);
    AsyncStorage.setItem('unicorn-paint-colors', JSON.stringify(DEFAULT_PAINT_COLORS)).catch(() => {});
  }, []);

  return (
    <UnicornContext.Provider
      value={{
        dressColors,
        sparkles,
        selectedZone,
        placedAccessories,
        paintColors,
        activePaintColor,
        unicornStyle,
        paintLocation,
        setDressColor,
        toggleSparkles,
        setSelectedZone,
        addPlacedAccessory,
        removePlacedAccessory,
        clearPlacedAccessories,
        setPaintColor,
        setActivePaintColor,
        resetDressColors,
        resetPaintColors,
        setUnicornStyle,
        setPaintLocation,
      }}
    >
      {children}
    </UnicornContext.Provider>
  );
}

export function useUnicorn() {
  const ctx = useContext(UnicornContext);
  if (!ctx) throw new Error('useUnicorn must be used within UnicornProvider');
  return ctx;
}
