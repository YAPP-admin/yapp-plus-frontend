import { expect, it } from 'vitest';
import {
  memberNoticeCategoryLabel,
  memberNoticeDateLabel,
  memberNoticeDeadlineLabel,
} from './notice-display';

it.each([
  ['SESSION', '세션'],
  ['ASSIGNMENT', '과제'],
  ['OPERATION', '기타'],
] as const)('공지 유형 %s을 %s로 표시한다', (type, label) => {
  expect(memberNoticeCategoryLabel(type)).toBe(label);
});

it.each([
  [null, undefined],
  [2, 'D-2'],
  [0, 'D-day'],
  [-3, 'D+3'],
] as const)('마감 일수 %s를 %s로 표시한다', (days, label) => {
  expect(memberNoticeDeadlineLabel(days)).toBe(label);
});

it('서울 기준 공지 날짜를 표시하고 잘못된 날짜를 거부한다', () => {
  expect(memberNoticeDateLabel('2026-11-07')).toContain('2026.11.07');
  expect(() => memberNoticeDateLabel('2026-02-29')).toThrow('올바르지 않은');
});
