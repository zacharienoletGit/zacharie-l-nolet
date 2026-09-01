import React from 'react';
import { ThemeProvider } from '../theme/ThemeProvider';
import { LibraryProvider } from './LibraryContext';
import { SettingsProvider, useSettings } from './SettingsContext';

function ThemedTree({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  return (
    <ThemeProvider themeMode={settings.themeMode} fontScale={settings.fontScale}>
      <LibraryProvider>{children}</LibraryProvider>
    </ThemeProvider>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ThemedTree>{children}</ThemedTree>
    </SettingsProvider>
  );
}
