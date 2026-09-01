import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import NetInfo from '@react-native-community/netinfo';
import type { Article, Bookmark, FeedCache, Note, SyncOp } from '../types/models';
import {
  emptyNote,
  isBookmarked,
  toggleBookmark as toggleBookmarkPure,
  upsertNote,
  deleteNote as deleteNotePure,
} from '../domain/library';
import { enqueue, makeOp } from '../domain/syncQueue';
import { fetchArticles } from '../services/api/catalog';
import { isRemoteEnabled } from '../services/config';
import { CATALOG } from '../data/articles';
import { mergeCatalog } from '../services/feeds/mapArticle';
import { runSync } from '../services/sync/engine';
import {
  loadBookmarks,
  loadFeedCache,
  loadLastSync,
  loadNotes,
  loadQueue,
  saveBookmarks,
  saveNotes,
  saveQueue,
} from '../services/storage/persist';

type LibraryContextValue = {
  articles: Article[];
  notes: Note[];
  bookmarks: Bookmark[];
  queue: SyncOp[];
  ready: boolean;
  online: boolean;
  lastSync: string | null;
  syncing: boolean;
  refreshing: boolean;
  error: string | null;
  refreshCatalog: () => Promise<void>;
  syncNow: () => Promise<void>;
  toggleBookmark: (articleId: string) => void;
  bookmarked: (articleId: string) => boolean;
  saveNote: (note: Note) => Note;
  removeNote: (id: string) => void;
  startNote: (articleId?: string) => Note;
  articleById: (id: string) => Article | undefined;
  feedCache: FeedCache | null;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [queue, setQueue] = useState<SyncOp[]>([]);
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const persistGate = useRef(false);
  const [feedCache, setFeedCache] = useState<FeedCache | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [storedNotes, storedBookmarks, storedQueue, storedSync, cachedFeeds] =
          await Promise.all([
            loadNotes(),
            loadBookmarks(),
            loadQueue(),
            loadLastSync(),
            loadFeedCache(),
          ]);
        if (cancelled) {
          return;
        }
        setNotes(storedNotes);
        setBookmarks(storedBookmarks);
        setQueue(storedQueue);
        setLastSync(storedSync);
        setFeedCache(cachedFeeds);
        setArticles(mergeCatalog(CATALOG, cachedFeeds?.articles ?? []));
        persistGate.current = true;
        setReady(true);
        try {
          const catalog = await fetchArticles();
          const nextCache = await loadFeedCache();
          if (!cancelled) {
            setArticles(catalog);
            setFeedCache(nextCache);
          }
        } catch (err) {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : 'Catalogue indisponible');
          }
        }
        return;
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Catalogue indisponible');
          persistGate.current = true;
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!persistGate.current) {
      return;
    }
    saveNotes(notes).catch(() => undefined);
  }, [notes]);

  useEffect(() => {
    if (!persistGate.current) {
      return;
    }
    saveBookmarks(bookmarks).catch(() => undefined);
  }, [bookmarks]);

  useEffect(() => {
    if (!persistGate.current) {
      return;
    }
    saveQueue(queue).catch(() => undefined);
  }, [queue]);

  const refreshCatalog = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const catalog = await fetchArticles();
      setArticles(catalog);
      setFeedCache(await loadFeedCache());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rafraîchissement impossible');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (!isRemoteEnabled() || syncing) {
      return;
    }
    setSyncing(true);
    setError(null);
    try {
      const result = await runSync({ notes, bookmarks, queue });
      setNotes(result.notes);
      setBookmarks(result.bookmarks);
      setQueue(result.queue);
      setLastSync(result.lastSync);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync impossible');
    } finally {
      setSyncing(false);
    }
  }, [notes, bookmarks, queue, syncing]);

  useEffect(() => {
    if (ready && online && isRemoteEnabled() && queue.length > 0) {
      syncNow().catch(() => undefined);
    }
    // Une tentative au passage online ; pas un retry infini.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, online]);

  const toggleBookmark = useCallback((articleId: string) => {
    const now = new Date().toISOString();
    setBookmarks(current => {
      const next = toggleBookmarkPure(current, articleId, now);
      const added = next.some(b => b.articleId === articleId);
      const op = added
        ? makeOp('bookmark', 'upsert', { articleId, savedAt: now }, now)
        : makeOp('bookmark', 'delete', { articleId }, now);
      setQueue(q => enqueue(q, op));
      return next;
    });
  }, []);

  const saveNote = useCallback((note: Note) => {
    const now = new Date().toISOString();
    const next: Note = { ...note, updatedAt: now };
    setNotes(current => upsertNote(current, next));
    setQueue(q => enqueue(q, makeOp('note', 'upsert', next, now)));
    return next;
  }, []);

  const removeNote = useCallback((id: string) => {
    const now = new Date().toISOString();
    setNotes(current => deleteNotePure(current, id));
    setQueue(q => enqueue(q, makeOp('note', 'delete', { id }, now)));
  }, []);

  const startNote = useCallback((articleId?: string) => {
    return emptyNote(new Date().toISOString(), articleId);
  }, []);

  const articleMap = useMemo(
    () => new Map(articles.map(article => [article.id, article])),
    [articles],
  );

  const value = useMemo<LibraryContextValue>(
    () => ({
      articles,
      notes,
      bookmarks,
      queue,
      ready,
      online,
      lastSync,
      syncing,
      refreshing,
      error,
      refreshCatalog,
      syncNow,
      toggleBookmark,
      bookmarked: (articleId: string) => isBookmarked(bookmarks, articleId),
      saveNote,
      removeNote,
      startNote,
      articleById: (id: string) => articleMap.get(id),
      feedCache,
    }),
    [
      articles,
      notes,
      bookmarks,
      queue,
      ready,
      online,
      lastSync,
      syncing,
      refreshing,
      error,
      refreshCatalog,
      syncNow,
      toggleBookmark,
      saveNote,
      removeNote,
      startNote,
      articleMap,
      feedCache,
    ],
  );

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error('useLibrary hors LibraryProvider');
  }
  return ctx;
}
