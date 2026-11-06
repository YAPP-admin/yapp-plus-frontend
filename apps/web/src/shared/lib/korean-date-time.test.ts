import { expect, it } from 'vitest';
import {
  formatKoreanTime,
  koreanDateString,
  koreanTimestamp,
  nextKoreanMidnight,
} from './korean-date-time';

it.each([
  ['00:00', '오전 12시'],
  ['12:00:00', '오후 12시'],
  ['13:30:59', '오후 1시 30분'],
  ['09:05', '오전 9시 5분'],
])('%s를 한국어 시간으로 표시한다', (input, expected) => {
  expect(formatKoreanTime(input)).toBe(expected);
});

it.each(['24:00', '12:60', '1:30', '12:00:60'])('잘못된 시간 %s를 거부한다', (time) => {
  expect(() => koreanTimestamp('2026-11-07', time)).toThrow('올바르지 않은');
});

it.each(['2026-02-29', '2026-04-31', '2026-13-01', '2026-1-01'])(
  '잘못된 날짜 %s를 거부한다',
  (date) => {
    expect(() => koreanTimestamp(date)).toThrow('올바르지 않은');
  },
);

it('한국 자정과 연말 경계가 기기 시간대에 의존하지 않는다', () => {
  expect(koreanTimestamp('2026-12-31', '23:59:59')).toBe(Date.parse('2026-12-31T14:59:59Z'));
  expect(koreanDateString(Date.parse('2026-12-31T15:00:00Z'))).toBe('2027-01-01');
  expect(nextKoreanMidnight('2026-12-31')).toBe(koreanTimestamp('2027-01-01'));
  expect(koreanTimestamp('2028-02-29')).toBe(Date.parse('2028-02-28T15:00:00Z'));
});
