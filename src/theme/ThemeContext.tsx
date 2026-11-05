import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { darkColors, lightColors, Palette } from './colors';

export type ThemeMode = 'light' | 'dark';
const KEY = 'cb_theme_mode';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  colors: Palette;
  setMode: (m: ThemeMode) => void;
}

const Ctx = createContext<ThemeState>({
  mode: 'light',
  isDark: false,
  colors: lightColors,
  setMode: () => {},
});

export const useTheme = () => useContext(Ctx);
/** Current palette – re-renders the component when the theme changes. */
export const useColors = () => useContext(Ctx).colors;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  // restore the saved choice (the 1.2 s splash hides the brief light→dark switch)
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v === 'dark' || v === 'light') setModeState(v);
      })
      .catch(() => {});
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(KEY, m).catch(() => {});
  }, []);

  const value = useMemo<ThemeState>(
    () => ({ mode, isDark: mode === 'dark', colors: mode === 'dark' ? darkColors : lightColors, setMode }),
    [mode, setMode],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
