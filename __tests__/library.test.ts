import {
  deleteNote,
  emptyNote,
  isBookmarked,
  notePreview,
  notesForArticle,
  standaloneNotes,
  toggleBookmark,
  upsertNote,
} from '../src/domain/library';
import type { Note } from '../src/types/models';

const note = (partial: Partial<Note>): Note => ({
  id: 'n1',
  title: 'Titre',
  body: 'Corps',
  createdAt: '2026-09-01T08:00:00Z',
  updatedAt: '2026-09-01T08:00:00Z',
  ...partial,
});

describe('classeur', () => {
  it('upsert insère puis remplace', () => {
    const first = note({ id: 'n1', title: 'A' });
    const next = upsertNote([first], { ...first, title: 'B' });
    expect(next).toHaveLength(1);
    expect(next[0].title).toBe('B');
  });

  it('sépare notes liées et notes libres', () => {
    const linked = note({ id: 'a', articleId: 'a-01' });
    const free = note({ id: 'b' });
    expect(notesForArticle([linked, free], 'a-01')).toEqual([linked]);
    expect(standaloneNotes([linked, free])).toEqual([free]);
  });

  it('toggle bookmark est idempotent par paire', () => {
    const once = toggleBookmark([], 'a-01', 't1');
    expect(isBookmarked(once, 'a-01')).toBe(true);
    const twice = toggleBookmark(once, 'a-01', 't2');
    expect(isBookmarked(twice, 'a-01')).toBe(false);
  });

  it('delete retire la feuille', () => {
    expect(deleteNote([note({ id: 'n1' }), note({ id: 'n2' })], 'n1')).toEqual([
      note({ id: 'n2' }),
    ]);
  });

  it('emptyNote peut lier un article', () => {
    const created = emptyNote('2026-09-01T08:00:00Z', 'a-03');
    expect(created.articleId).toBe('a-03');
    expect(created.body).toBe('');
  });

  it('notePreview coupe proprement', () => {
    const long = note({ body: 'x'.repeat(200) });
    expect(notePreview(long, 20).endsWith('…')).toBe(true);
  });
});
