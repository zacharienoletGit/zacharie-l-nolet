import { formatEditionDate, formatStamp } from '../lib/dates';
import { noteCivilDate, notesOnDay, type SundayRevue } from './calendarNotes';
import type { Article, Bookmark, Note } from '../types/models';

function noteBlock(note: Note, article?: Article): string {
  const title = note.title.trim() || 'Sans titre';
  const link = article
    ? `\n_En marge de : ${article.title}_\n`
    : '\n';
  return `### ${title}\n${link}\n${note.body.trim() || '_Feuille vide._'}\n`;
}

export function renderClasseurMarkdown(input: {
  notes: Note[];
  bookmarks: Bookmark[];
  articles: Article[];
  exportedAt: string;
}): string {
  const byId = new Map(input.articles.map(a => [a.id, a]));
  const days = [...new Set(input.notes.map(noteCivilDate).filter((d): d is string => Boolean(d)))].sort();

  const lines: string[] = [
    '# Classeur — Zacharie L. Nolet',
    '',
    `Exporté le ${formatStamp(input.exportedAt)}.`,
    '',
    'Mémoire locale. Rien n’est un fil social.',
    '',
  ];

  if (input.bookmarks.length) {
    lines.push('## Coupures', '');
    for (const mark of input.bookmarks) {
      const article = byId.get(mark.articleId);
      const label = article?.title ?? mark.articleId;
      const url = article?.canonicalUrl;
      lines.push(
        url
          ? `- ${label} — ${url}`
          : `- ${label}`,
      );
    }
    lines.push('');
  }

  if (!days.length) {
    lines.push('## Notes', '', '_Aucune feuille datée._', '');
  } else {
    for (const day of days) {
      lines.push(`## ${formatEditionDate(day)}`, '');
      for (const note of notesOnDay(input.notes, day)) {
        lines.push(noteBlock(note, note.articleId ? byId.get(note.articleId) : undefined));
      }
    }
  }

  return `${lines.join('\n').trim()}\n`;
}

export function renderRevueMarkdown(revue: SundayRevue, articles: Article[]): string {
  const byId = new Map(articles.map(a => [a.id, a]));
  const lines: string[] = [
    '# Revue du dimanche — Zacharie L. Nolet',
    '',
    `Semaine ${revue.label} (${revue.start} → ${revue.end}).`,
    revue.isSunday
      ? 'Clôture de semaine.'
      : 'Semaine en cours — la revue se clôt le dimanche.',
    '',
    `${revue.noteCount} note${revue.noteCount > 1 ? 's' : ''}.`,
    '',
  ];

  for (const day of revue.days) {
    lines.push(`## ${day.label}`, '');
    if (!day.notes.length) {
      lines.push('_Silence._', '');
      continue;
    }
    for (const note of day.notes) {
      lines.push(noteBlock(note, note.articleId ? byId.get(note.articleId) : undefined));
    }
  }

  return `${lines.join('\n').trim()}\n`;
}
