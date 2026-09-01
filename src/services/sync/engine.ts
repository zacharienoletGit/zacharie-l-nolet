import type { Bookmark, Note, SyncOp } from '../../types/models';
import { dequeueConsumed, mergeBookmarks, mergeNotes } from '../../domain/syncQueue';
import { isRemoteEnabled } from '../config';
import {
  destroyRemoteBookmark,
  destroyRemoteNote,
  pullBookmarks,
  pullNotes,
  pushBookmark,
  pushNote,
} from '../api/catalog';
import { saveLastSync } from '../storage/persist';

export type SyncInput = {
  notes: Note[];
  bookmarks: Bookmark[];
  queue: SyncOp[];
};

export type SyncResult = {
  notes: Note[];
  bookmarks: Bookmark[];
  queue: SyncOp[];
  lastSync: string;
  pushed: number;
};

/**
 * Pousse la file, puis tire.
 * Échec réseau : on garde la file, on ne touche pas au local au-delà du merge réussi.
 */
export async function runSync(input: SyncInput): Promise<SyncResult> {
  if (!isRemoteEnabled()) {
    const lastSync = new Date().toISOString();
    return { ...input, lastSync, pushed: 0 };
  }

  const consumed: string[] = [];

  for (const op of input.queue) {
    if (op.entity === 'note' && op.action === 'upsert') {
      await pushNote(op.payload as Note);
    } else if (op.entity === 'note' && op.action === 'delete') {
      await destroyRemoteNote((op.payload as { id: string }).id);
    } else if (op.entity === 'bookmark' && op.action === 'upsert') {
      await pushBookmark(op.payload as Bookmark);
    } else if (op.entity === 'bookmark' && op.action === 'delete') {
      await destroyRemoteBookmark((op.payload as { articleId: string }).articleId);
    }
    consumed.push(op.id);
  }

  const [remoteNotes, remoteBookmarks] = await Promise.all([
    pullNotes(),
    pullBookmarks(),
  ]);

  const lastSync = new Date().toISOString();
  await saveLastSync(lastSync);

  return {
    notes: mergeNotes(input.notes, remoteNotes),
    bookmarks: mergeBookmarks(input.bookmarks, remoteBookmarks),
    queue: dequeueConsumed(input.queue, consumed),
    lastSync,
    pushed: consumed.length,
  };
}
