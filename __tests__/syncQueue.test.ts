import {
  dequeueConsumed,
  enqueue,
  makeOp,
  mergeBookmarks,
  mergeNotes,
} from '../src/domain/syncQueue';
import type { Bookmark, Note } from '../src/types/models';

const note = (id: string, updatedAt: string): Note => ({
  id,
  title: id,
  body: '',
  createdAt: updatedAt,
  updatedAt,
});

describe('file de sync', () => {
  it('déduplique une même entité + action', () => {
    const a = makeOp('note', 'upsert', note('n1', 't1'), 't1');
    const b = makeOp('note', 'upsert', note('n1', 't2'), 't2');
    const queue = enqueue(enqueue([], a), b);
    expect(queue).toHaveLength(1);
    expect(queue[0].id).toBe(b.id);
  });

  it('retire les ops consommées', () => {
    const op = makeOp('bookmark', 'delete', { articleId: 'a-01' }, 't1');
    expect(dequeueConsumed([op], [op.id])).toEqual([]);
  });

  it('merge notes : le plus récent gagne', () => {
    const local = [note('n1', '2026-09-01T10:00:00Z')];
    const remote = [note('n1', '2026-09-01T12:00:00Z')];
    expect(mergeNotes(local, remote)[0].updatedAt).toBe('2026-09-01T12:00:00Z');
  });

  it('merge bookmarks : last-write-wins sur savedAt', () => {
    const local: Bookmark[] = [{ articleId: 'a-01', savedAt: 't1' }];
    const remote: Bookmark[] = [{ articleId: 'a-01', savedAt: 't9' }];
    expect(mergeBookmarks(local, remote)[0].savedAt).toBe('t9');
  });
});
