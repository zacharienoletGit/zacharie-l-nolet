import type { Bookmark, Note } from '../types/models';

/** Contrat de note — local-first, sync optionnelle. */
export const SAMPLE_NOTE: Note = {
  id: 'note_demo_001',
  articleId: 'a-01',
  title: 'Clôture volontaire',
  body: 'Observé : une édition a une fin.\nInférence : le fil n’en a pas.\nÀ valider : est-ce que dix textes me suffisent une semaine ?',
  createdAt: '2026-09-01T08:12:00-04:00',
  updatedAt: '2026-09-01T08:14:00-04:00',
};

export const SAMPLE_FREE_NOTE: Note = {
  id: 'note_demo_002',
  title: 'Hors article',
  body: 'Une feuille libre n’a pas besoin d’une coupure. Le classeur n’est pas un bookmark manager.',
  createdAt: '2026-09-01T21:00:00-04:00',
  updatedAt: '2026-09-01T21:00:00-04:00',
};

export const SAMPLE_BOOKMARK: Bookmark = {
  articleId: 'a-01',
  savedAt: '2026-09-01T08:10:00-04:00',
};
