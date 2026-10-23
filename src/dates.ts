import dayjs, { Dayjs } from 'dayjs';
import type { DateRange, StandupOptions } from './types.js';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Get the most recent workday before the given date
 * Monday, Saturday and Sunday all resolve to the previous Friday
 */
export function previousWorkday(date: Dayjs): Dayjs {
  let day = date.subtract(1, 'day');
  while (day.day() === 0 || day.day() === 6) {
    day = day.subtract(1, 'day');
  }
  return day.startOf('day');
}

/**
 * Get the Monday that starts the week containing the given date
 */
export function startOfWorkWeek(date: Dayjs): Dayjs {
  return date.subtract((date.day() + 6) % 7, 'day').startOf('day');
}

/**
 * Parse a --since / --until value into a date
 * Accepts: "today", "yesterday" (previous workday), or YYYY-MM-DD
 */
export function parseDateInput(input: string, now: Dayjs = dayjs()): Dayjs {
  const value = input.trim().toLowerCase();

  if (value === 'today') {
    return now.startOf('day');
  }
  if (value === 'yesterday') {
    return previousWorkday(now);
  }
  if (ISO_DATE.test(value)) {
    const date = dayjs(value);
    if (date.isValid() && date.format('YYYY-MM-DD') === value) {
      return date.startOf('day');
    }
  }

  throw new Error(
    `Invalid date "${input}". Use "today", "yesterday", or a date like 2026-10-24.`,
  );
}

/**
 * Resolve the date range to report on
 * Precedence: --week / --last-week, then --since / --until, then --days
 */
export function resolveDateRange(options: StandupOptions, now: Dayjs = dayjs()): DateRange {
  if (options.week) {
    return { start: startOfWorkWeek(now), end: now, label: 'This week' };
  }

  if (options.lastWeek) {
    const start = startOfWorkWeek(now).subtract(7, 'day');
    return { start, end: start.add(6, 'day').endOf('day'), label: 'Last week' };
  }

  if (options.since || options.until) {
    const start = options.since
      ? parseDateInput(options.since, now)
      : now.subtract(options.days || 1, 'day');
    const end = options.until ? parseDateInput(options.until, now).endOf('day') : now;

    if (end.isBefore(start)) {
      throw new Error('--until must be the same as or later than --since.');
    }

    return { start, end, label: formatRangeLabel(start, end, now) };
  }

  const days = options.days || 1;
  return {
    start: now.subtract(days, 'day'),
    end: now,
    label: `Last ${days} day${days !== 1 ? 's' : ''}`,
  };
}

/**
 * Build a human-readable label such as "Since Fri Oct 23" or "Oct 20 – Oct 24"
 */
function formatRangeLabel(start: Dayjs, end: Dayjs, now: Dayjs): string {
  if (end.isSame(now)) {
    return `Since ${start.format('ddd MMM D')}`;
  }
  if (start.isSame(end, 'day')) {
    return start.format('ddd MMM D');
  }
  return `${start.format('MMM D')} – ${end.format('MMM D')}`;
}
