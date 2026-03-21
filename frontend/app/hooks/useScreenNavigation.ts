import { useCallback, useRef, useState } from "react";
import type { Screen } from "../types/types";

export function useScreenNavigation(initialScreen: Screen = "name") {
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const screenRef = useRef<Screen>(initialScreen);

  // Update ref whenever screen changes
  const updateScreen = useCallback((newScreen: Screen) => {
    setScreen(newScreen);
    screenRef.current = newScreen;
  }, []);

  return {
    screen,
    setScreen: updateScreen,
    screenRef,
  };
}
