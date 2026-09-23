import { renderClasseurMarkdown, renderRevueMarkdown } from '../src/domain/classeurMarkdown';
import { buildSundayRevue } from '../src/domain/calendarNotes';
import type { Article, Note } from '../src/types/models';

const article: Article = {
  id: 'a-01',
  slug: 'x',
  title: 'L’édition contre le fil',
  dek: 'dek',
  body: 'body',
  section: 'philosophie',
  publishedAt: '2026-09-01T06:00:00-04:00',
  readingMinutes: 6,
  source: 'Cabinet',
  region: 'CULTURE',
  keywords: [],
};

const note: Note = {
  id: 'n1',
  articleId: 'a-01',
  title: 'Clôture',
  body: 'Observé : dix textes.',
  createdAt: '2026-09-01T08:00:00-04:00',
  updatedAt: '2026-09-01T08:10:00-04:00',
};

describe('export markdown', () => {
  it('classe les notes par jour civil', () => {
    const md = renderClasseurMarkdown({
      notes: [note],
      bookmarks: [{ articleId: 'a-01', savedAt: '2026-09-01T08:00:00-04:00' }],
      articles: [article],
      exportedAt: '2026-09-01T21:00:00-04:00',
    });
    expect(md).toContain('# Classeur — Ludovic Zacharie Nolet Gilbert');
    expect(md).toContain('## Coupures');
    expect(md).toContain('L’édition contre le fil');
    expect(md).toContain('mardi 1 septembre 2026');
    expect(md).toContain('Observé : dix textes.');
  });

  it('exporte la revue dimanche jour par jour', () => {
    const revue = buildSundayRevue([note], '2026-09-06');
    const md = renderRevueMarkdown(revue, [article]);
    expect(md).toContain('# Revue du dimanche');
    expect(md).toContain('Clôture de semaine');
    expect(md).toContain('En marge de : L’édition contre le fil');
  });
});
