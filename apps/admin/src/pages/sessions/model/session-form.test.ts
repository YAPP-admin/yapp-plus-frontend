import { expect, it } from 'vitest';
import { parseSessionForm } from './session-form';

const base = {
  name: '세션',
  startDate: '2026-11-20',
  endDate: '2026-11-20',
  startTime: '23:00',
  endTime: '01:00',
  type: 'team' as const,
  location: { roadAddress: '', detailAddress: '' },
};

it('다음 날 종료하는 세션은 전체 종료 일시가 늦으면 허용한다', () => {
  const result = parseSessionForm({ ...base, endDate: '2026-11-21' });

  expect(result.success).toBe(true);
  if (!result.success) {
    throw new Error('유효한 날짜 범위가 거부되었습니다.');
  }
  expect(result.data).toMatchObject({
    startDate: '2026-11-20',
    endDate: '2026-11-21',
    startTime: '23:00:00',
    endTime: '01:00:00',
  });
});

it('종료일이 시작일보다 빠르면 종료일 필드에 오류를 연결한다', () => {
  const result = parseSessionForm({ ...base, endDate: '2026-11-19' });

  expect(result.error?.issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        path: ['endDate'],
        message: '종료일은 시작일보다 빠를 수 없습니다.',
      }),
    ]),
  );
});

it('같은 날짜에서 종료 시간이 같거나 빠르면 종료 시간 필드에 오류를 연결한다', () => {
  const result = parseSessionForm(base);

  expect(result.error?.issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        path: ['endTime'],
        message: '종료 시간은 시작 시간보다 늦어야 합니다.',
      }),
    ]),
  );
});
