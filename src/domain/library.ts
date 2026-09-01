import type { Bookmark, Note } from '../types/models';

export function upsertNote(notes: Note[], next: Note): Note[] {
  const index = notes.findIndex(n => n.id === next.id);
  if (index === -1) {
    return [next, ...notes];
  }
  const copy = notes.slice();
  copy[index] = next;
  return copy;
}

export function deleteNote(notes: Note[], id: string): Note[] {
  return notes.filter(n => n.id !== id);
}

export function notesForArticle(notes: Note[], articleId: string): Note[] {
  return notes
    .filter(n => n.articleId === articleId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function standaloneNotes(notes: Note[]): Note[] {
  return notes
    .filter(n => !n.articleId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function isBookmarked(bookmarks: Bookmark[], articleId: string): boolean {
  return bookmarks.some(b => b.articleId === articleId);
}

export function toggleBookmark(
  bookmarks: Bookmark[],
  articleId: string,
  savedAt: string,
): Bookmark[] {
  if (isBookmarked(bookmarks, articleId)) {
    return bookmarks.filter(b => b.articleId !== articleId);
  }
  return [{ articleId, savedAt }, ...bookmarks];
}

export function createNoteId(nowMs: number = Date.now()): string {
  return `note_${nowMs.toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyNote(nowIso: string, articleId?: string): Note {
  return {
    id: createNoteId(Date.parse(nowIso) || Date.now()),
    articleId,
    title: '',
    body: '',
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export function notePreview(note: Note, max = 140): string {
  const text = note.body.replace(/\s+/g, ' ').trim();
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max).trim()}…`;
}
