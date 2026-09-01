import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { AppSettings, FontScaleId, ThemeMode } from '../types/models';
import {
  defaultSettings,
  loadSettings,
  saveSettings,
} from '../services/storage/persist';

type SettingsContextValue = {
  settings: AppSettings;
  ready: boolean;
  setThemeMode: (themeMode: ThemeMode) => void;
  setFontScale: (fontScale: FontScaleId) => void;
  completeOnboarding: () => void;
  replayOnboarding: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSettings()
      .then(stored => {
        if (!cancelled) {
          setSettings({ ...defaultSettings, ...stored });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    saveSettings(settings).catch(() => undefined);
  }, [settings, ready]);

  const patch = useCallback((partial: Partial<AppSettings>) => {
    setSettings(current => ({ ...current, ...partial }));
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      ready,
      setThemeMode: themeMode => patch({ themeMode }),
      setFontScale: fontScale => patch({ fontScale }),
      completeOnboarding: () => patch({ onboardingDone: true }),
      replayOnboarding: () => patch({ onboardingDone: false }),
    }),
    [settings, ready, patch],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings hors SettingsProvider');
  }
  return ctx;
}
