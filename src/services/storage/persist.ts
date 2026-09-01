import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, Bookmark, FeedCache, Note, SyncOp } from '../../types/models';

export const STORAGE_KEYS = {
  notes: 'zln.notes.v1',
  bookmarks: 'zln.bookmarks.v1',
  settings: 'zln.settings.v1',
  queue: 'zln.syncQueue.v1',
  lastSync: 'zln.lastSync.v1',
  feeds: 'zln.feeds.v1',
} as const;

export const defaultSettings: AppSettings = {
  themeMode: 'system',
  fontScale: 'regular',
  onboardingDone: false,
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export function loadNotes(): Promise<Note[]> {
  return readJson<Note[]>(STORAGE_KEYS.notes, []);
}

export function saveNotes(notes: Note[]): Promise<void> {
  return writeJson(STORAGE_KEYS.notes, notes);
}

export function loadBookmarks(): Promise<Bookmark[]> {
  return readJson<Bookmark[]>(STORAGE_KEYS.bookmarks, []);
}

export function saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
  return writeJson(STORAGE_KEYS.bookmarks, bookmarks);
}

export function loadSettings(): Promise<AppSettings> {
  return readJson<AppSettings>(STORAGE_KEYS.settings, defaultSettings);
}

export function saveSettings(settings: AppSettings): Promise<void> {
  return writeJson(STORAGE_KEYS.settings, settings);
}

export function loadQueue(): Promise<SyncOp[]> {
  return readJson<SyncOp[]>(STORAGE_KEYS.queue, []);
}

export function saveQueue(ops: SyncOp[]): Promise<void> {
  return writeJson(STORAGE_KEYS.queue, ops);
}

export function loadLastSync(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.lastSync);
}

export function saveLastSync(iso: string): Promise<void> {
  return AsyncStorage.setItem(STORAGE_KEYS.lastSync, iso);
}

export function loadFeedCache(): Promise<FeedCache | null> {
  return readJson<FeedCache | null>(STORAGE_KEYS.feeds, null);
}

export function saveFeedCache(cache: FeedCache): Promise<void> {
  return writeJson(STORAGE_KEYS.feeds, cache);
}
