import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import {
  previousWorkday,
  startOfWorkWeek,
  parseDateInput,
  resolveDateRange,
} from '../src/dates.js';

const fmt = (d: dayjs.Dayjs) => d.format('YYYY-MM-DD HH:mm');

describe('dates', () => {
  // 2026-10-26 is a Monday
  const monday = dayjs('2026-10-26T10:00:00');
  const tuesday = dayjs('2026-10-27T10:00:00');
  const wednesday = dayjs('2026-10-28T10:00:00');
  const saturday = dayjs('2026-10-31T10:00:00');
  const sunday = dayjs('2026-11-01T10:00:00');

  describe('previousWorkday', () => {
    it('should skip the weekend on Monday', () => {
      expect(fmt(previousWorkday(monday))).toBe('2026-10-23 00:00');
    });

    it('should return Friday on Saturday and Sunday', () => {
      expect(fmt(previousWorkday(saturday))).toBe('2026-10-30 00:00');
      expect(fmt(previousWorkday(sunday))).toBe('2026-10-30 00:00');
    });

    it('should return the day before on a weekday', () => {
      expect(fmt(previousWorkday(tuesday))).toBe('2026-10-26 00:00');
    });
  });

  describe('startOfWorkWeek', () => {
    it('should return Monday for any day of the week', () => {
      expect(fmt(startOfWorkWeek(wednesday))).toBe('2026-10-26 00:00');
      expect(fmt(startOfWorkWeek(monday))).toBe('2026-10-26 00:00');
      expect(fmt(startOfWorkWeek(sunday))).toBe('2026-10-26 00:00');
    });
  });

  describe('parseDateInput', () => {
    it('should parse keywords', () => {
      expect(fmt(parseDateInput('today', monday))).toBe('2026-10-26 00:00');
      expect(fmt(parseDateInput('Yesterday', monday))).toBe('2026-10-23 00:00');
    });

    it('should parse ISO dates', () => {
      expect(fmt(parseDateInput('2026-10-20', monday))).toBe('2026-10-20 00:00');
    });

    it('should reject invalid input', () => {
      expect(() => parseDateInput('last tuesday', monday)).toThrow(/Invalid date/);
      expect(() => parseDateInput('2026-02-30', monday)).toThrow(/Invalid date/);
    });
  });

  describe('resolveDateRange', () => {
    it('should default to the last N days', () => {
      const range = resolveDateRange({ days: 2 }, monday);
      expect(fmt(range.start)).toBe('2026-10-24 10:00');
      expect(fmt(range.end)).toBe('2026-10-26 10:00');
      expect(range.label).toBe('Last 2 days');
    });

    it('should support --since yesterday on a Monday', () => {
      const range = resolveDateRange({ since: 'yesterday' }, monday);
      expect(fmt(range.start)).toBe('2026-10-23 00:00');
      expect(range.end.isSame(monday)).toBe(true);
      expect(range.label).toBe('Since Fri Oct 23');
    });

    it('should make --until inclusive of the whole day', () => {
      const range = resolveDateRange({ since: '2026-10-19', until: '2026-10-23' }, monday);
      expect(fmt(range.start)).toBe('2026-10-19 00:00');
      expect(fmt(range.end)).toBe('2026-10-23 23:59');
      expect(range.label).toBe('Oct 19 – Oct 23');
    });

    it('should reject --until before --since', () => {
      expect(() =>
        resolveDateRange({ since: '2026-10-23', until: '2026-10-19' }, monday),
      ).toThrow(/--until/);
    });

    it('should support --week', () => {
      const range = resolveDateRange({ week: true }, wednesday);
      expect(fmt(range.start)).toBe('2026-10-26 00:00');
      expect(range.label).toBe('This week');
    });

    it('should support --last-week as Monday to Sunday', () => {
      const range = resolveDateRange({ lastWeek: true }, wednesday);
      expect(fmt(range.start)).toBe('2026-10-19 00:00');
      expect(fmt(range.end)).toBe('2026-10-25 23:59');
      expect(range.label).toBe('Last week');
    });

    it('should give --week precedence over --since and --days', () => {
      const range = resolveDateRange({ week: true, since: '2026-01-01', days: 30 }, wednesday);
      expect(range.label).toBe('This week');
    });
  });
});
