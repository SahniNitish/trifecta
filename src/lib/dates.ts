import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);

export function todayStr(): string {
  return dayjs().format('YYYY-MM-DD');
}

export function tomorrowStr(): string {
  return dayjs().add(1, 'day').format('YYYY-MM-DD');
}

export function formatDateHeader(date = todayStr()): string {
  return dayjs(date).format('dddd, MMM D');
}

export function formatDayLabel(date: string): string {
  const d = dayjs(date);
  if (d.isSame(dayjs(), 'day')) return 'Today';
  if (d.isSame(dayjs().add(1, 'day'), 'day')) return 'Tomorrow';
  return d.format('MMM D');
}

export function weekStartStr(date = todayStr()): string {
  return dayjs(date).startOf('isoWeek').format('YYYY-MM-DD');
}

export function weekEndStr(date = todayStr()): string {
  return dayjs(date).endOf('isoWeek').format('YYYY-MM-DD');
}

export function monthStartStr(date = todayStr()): string {
  return dayjs(date).startOf('month').format('YYYY-MM-DD');
}

export function monthEndStr(date = todayStr()): string {
  return dayjs(date).endOf('month').format('YYYY-MM-DD');
}

export function daysInWeek(date = todayStr()): string[] {
  const start = dayjs(date).startOf('isoWeek');
  return Array.from({ length: 7 }, (_, i) => start.add(i, 'day').format('YYYY-MM-DD'));
}

export function daysInMonth(date = todayStr()): string[] {
  const start = dayjs(date).startOf('month');
  const days = start.daysInMonth();
  return Array.from({ length: days }, (_, i) => start.add(i, 'day').format('YYYY-MM-DD'));
}

export function isDateInRange(date: string, start: string, end: string): boolean {
  const d = dayjs(date);
  return !d.isBefore(start, 'day') && !d.isAfter(end, 'day');
}

export function daysMeeting(
  dates: string[],
  predicate: (date: string) => boolean,
  rangeStart: string,
  rangeEnd: string,
): number {
  const unique = new Set(dates.filter((d) => isDateInRange(d, rangeStart, rangeEnd)));
  return [...unique].filter(predicate).length;
}