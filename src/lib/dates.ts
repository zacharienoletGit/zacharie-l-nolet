const JOURS = [
  'dimanche',
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
];

const MOIS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

export function civilDate(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatEditionDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  const jour = JOURS[date.getDay()];
  const mois = MOIS[date.getMonth()];
  return `${jour} ${d} ${mois} ${y}`;
}

export function formatStamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const j = date.getDate();
  const mois = MOIS[date.getMonth()];
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${j} ${mois}, ${h}h${min}`;
}

export function parseCivil(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function shiftCivil(isoDate: string, days: number): string {
  const date = parseCivil(isoDate);
  date.setDate(date.getDate() + days);
  return civilDate(date);
}

export function weekdaySunday0(isoDate: string): number {
  return parseCivil(isoDate).getDay();
}

export function isSunday(isoDate: string): boolean {
  return weekdaySunday0(isoDate) === 0;
}

/** Semaine civile Québec : lundi → dimanche. */
export function weekRangeMonday(isoDate: string): { start: string; end: string } {
  const dow = weekdaySunday0(isoDate);
  const offsetToMonday = dow === 0 ? -6 : 1 - dow;
  const start = shiftCivil(isoDate, offsetToMonday);
  return { start, end: shiftCivil(start, 6) };
}

export function formatWeekLabel(start: string, end: string): string {
  const a = parseCivil(start);
  const b = parseCivil(end);
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()}–${b.getDate()} ${MOIS[a.getMonth()]} ${a.getFullYear()}`;
  }
  return `${formatEditionDate(start)} — ${formatEditionDate(end)}`;
}

export function monthMeta(isoDate: string): { year: number; month: number } {
  const date = parseCivil(isoDate);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function civilFromMonthDay(
  year: number,
  month1: number,
  day: number,
): string {
  return civilDate(new Date(year, month1 - 1, day));
}

export function daysInMonth(year: number, month1: number): number {
  return new Date(year, month1, 0).getDate();
}

export function monthTitle(year: number, month1: number): string {
  return `${MOIS[month1 - 1]} ${year}`;
}

export const WEEKDAY_LABELS_MON = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export type CalendarCell = {
  date: string;
  inMonth: boolean;
};

/** Grille lundi→dimanche, 6 semaines. */
export function monthGrid(year: number, month1: number): CalendarCell[] {
  const first = new Date(year, month1 - 1, 1);
  const firstDow = first.getDay();
  const lead = firstDow === 0 ? 6 : firstDow - 1;
  const start = new Date(year, month1 - 1, 1 - lead);
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return {
      date: civilDate(date),
      inMonth: date.getMonth() === month1 - 1,
    };
  });
}

export function civilFromTimestamp(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return civilDate(date);
}
