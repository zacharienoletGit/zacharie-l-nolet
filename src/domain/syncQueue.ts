import type { Bookmark, Note, SyncOp } from '../types/models';

export function enqueue(ops: SyncOp[], op: SyncOp): SyncOp[] {
  const withoutDup = ops.filter(
    existing =>
      !(
        existing.entity === op.entity &&
        entityKey(existing) === entityKey(op) &&
        existing.action === op.action
      ),
  );
  return [...withoutDup, op];
}

function entityKey(op: SyncOp): string {
  const payload = op.payload as { id?: string; articleId?: string };
  return payload.id ?? payload.articleId ?? op.id;
}

export function dequeueConsumed(ops: SyncOp[], consumedIds: string[]): SyncOp[] {
  const gone = new Set(consumedIds);
  return ops.filter(op => !gone.has(op.id));
}

/**
 * Last-write-wins sur updatedAt.
 * Local gagne si plus récent — l’appareil reste la vérité hors-ligne.
 */
export function mergeNotes(local: Note[], remote: Note[]): Note[] {
  const map = new Map<string, Note>();
  for (const note of local) {
    map.set(note.id, note);
  }
  for (const incoming of remote) {
    const current = map.get(incoming.id);
    if (!current || incoming.updatedAt >= current.updatedAt) {
      map.set(incoming.id, incoming);
    }
  }
  return [...map.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function mergeBookmarks(
  local: Bookmark[],
  remote: Bookmark[],
): Bookmark[] {
  const map = new Map<string, Bookmark>();
  for (const item of local) {
    map.set(item.articleId, item);
  }
  for (const incoming of remote) {
    const current = map.get(incoming.articleId);
    if (!current || incoming.savedAt >= current.savedAt) {
      map.set(incoming.articleId, incoming);
    }
  }
  return [...map.values()].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function makeOp(
  entity: SyncOp['entity'],
  action: SyncOp['action'],
  payload: unknown,
  updatedAt: string,
): SyncOp {
  const key =
    entity === 'note'
      ? (payload as Note).id
      : (payload as Bookmark | { articleId: string }).articleId;
  return {
    id: `${entity}:${action}:${key}:${updatedAt}`,
    entity,
    action,
    payload,
    updatedAt,
  };
}
