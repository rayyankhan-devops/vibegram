import { describe, it, expect } from 'vitest';
import { formatTimeAgo } from '../src/utils/date';

describe('Date Utilities', () => {
  it('formats current time as seconds ago or just now', () => {
    const now = new Date().toISOString();
    const result = formatTimeAgo(now);
    expect(['just now', '1s', '2s']).toContain(result);
  });

  it('formats minutes correctly', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatTimeAgo(fiveMinutesAgo)).toBe('5m');
  });

  it('formats hours correctly', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
    expect(formatTimeAgo(twoHoursAgo)).toBe('2h');
  });

  it('formats days correctly', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400 * 1000).toISOString();
    expect(formatTimeAgo(threeDaysAgo)).toBe('3d');
  });
});
