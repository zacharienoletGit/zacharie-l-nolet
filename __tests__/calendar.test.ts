import {
  buildSundayRevue,
  notesOnDay,
  noteCivilDate,
} from '../src/domain/calendarNotes';
import { isSunday, weekRangeMonday } from '../src/lib/dates';
import type { Note } from '../src/types/models';

const note = (id: string, createdAt: string): Note => ({
  id,
  title: id,
  body: 'marge',
  createdAt,
  updatedAt: '2026-09-06T20:00:00.000Z',
});

describe('calendrier des notes', () => {
  it('classe au jour de création, pas updatedAt', () => {
    const n = note('n1', '2026-09-01T08:00:00-04:00');
    expect(noteCivilDate(n)).toBe('2026-09-01');
    expect(notesOnDay([n], '2026-09-06')).toHaveLength(0);
    expect(notesOnDay([n], '2026-09-01')).toHaveLength(1);
  });

  it('la semaine du mardi 1er septembre 2026 va du lundi 31 au dimanche 6', () => {
    expect(weekRangeMonday('2026-09-01')).toEqual({
      start: '2026-08-31',
      end: '2026-09-06',
    });
    expect(isSunday('2026-09-06')).toBe(true);
    expect(isSunday('2026-09-01')).toBe(false);
  });

  it('la revue du dimanche groupe les 7 jours', () => {
    const notes = [
      note('a', '2026-09-01T10:00:00-04:00'),
      note('b', '2026-09-03T10:00:00-04:00'),
      note('outside', '2026-08-20T10:00:00-04:00'),
    ];
    const revue = buildSundayRevue(notes, '2026-09-06');
    expect(revue.isSunday).toBe(true);
    expect(revue.days).toHaveLength(7);
    expect(revue.noteCount).toBe(2);
    expect(revue.days.find(d => d.date === '2026-09-01')?.notes[0].id).toBe('a');
    expect(revue.days.find(d => d.date === '2026-08-31')?.notes).toHaveLength(0);
  });
});
