import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * Returns true if the user has enabled Reduce Motion in iOS Settings.
 * Animation sequences should be skipped when this is true.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduced)
      .catch(() => {});

    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced
    );
    return () => sub.remove();
  }, []);

  return reduced;
}
