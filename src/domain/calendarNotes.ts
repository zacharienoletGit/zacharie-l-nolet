import {
  civilFromTimestamp,
  formatEditionDate,
  isSunday,
  weekRangeMonday,
  formatWeekLabel,
} from '../lib/dates';
import type { Note } from '../types/models';

/** Grain calendrier : le jour de création, pas la dernière retouche. */
export function noteCivilDate(note: Note): string | null {
  return civilFromTimestamp(note.createdAt);
}

export function notesOnDay(notes: Note[], date: string): Note[] {
  return notes
    .filter(note => noteCivilDate(note) === date)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function notesInRange(notes: Note[], start: string, end: string): Note[] {
  return notes
    .filter(note => {
      const day = noteCivilDate(note);
      return Boolean(day && day >= start && day <= end);
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function daysWithNotes(notes: Note[]): Set<string> {
  const days = new Set<string>();
  for (const note of notes) {
    const day = noteCivilDate(note);
    if (day) {
      days.add(day);
    }
  }
  return days;
}

export type RevueDay = {
  date: string;
  label: string;
  notes: Note[];
};

export type SundayRevue = {
  start: string;
  end: string;
  label: string;
  isSunday: boolean;
  days: RevueDay[];
  noteCount: number;
};

export function buildSundayRevue(
  notes: Note[],
  today: string,
): SundayRevue {
  const { start, end } = weekRangeMonday(today);
  const weekNotes = notesInRange(notes, start, end);
  const days: RevueDay[] = [];
  let cursor = start;
  while (cursor <= end) {
    const ofDay = notesOnDay(weekNotes, cursor);
    days.push({
      date: cursor,
      label: formatEditionDate(cursor),
      notes: ofDay,
    });
    const [y, m, d] = cursor.split('-').map(Number);
    const next = new Date(y, (m ?? 1) - 1, (d ?? 1) + 1);
    const mm = String(next.getMonth() + 1).padStart(2, '0');
    const dd = String(next.getDate()).padStart(2, '0');
    cursor = `${next.getFullYear()}-${mm}-${dd}`;
  }
  return {
    start,
    end,
    label: formatWeekLabel(start, end),
    isSunday: isSunday(today),
    days,
    noteCount: weekNotes.length,
  };
}
