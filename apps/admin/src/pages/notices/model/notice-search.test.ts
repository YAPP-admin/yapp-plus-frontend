import { describe, expect, it } from 'vitest';
import { noticeSearchSchema } from './notice-search';

describe('공지 종류 쿼리', () => {
  it.each(['all', 'session', 'submission', 'operation'])('%s를 유지한다', (category) => {
    expect(noticeSearchSchema.parse({ category })).toEqual({ category });
  });

  it.each([
    undefined,
    null,
    '',
    'unknown',
    'SESSION',
    1,
    true,
    ['session'],
    { category: 'session' },
  ])('잘못된 외부 입력 %j를 기본값으로 처리한다', (category) => {
    expect(noticeSearchSchema.parse({ category })).toEqual({ category: 'all' });
  });

  it('누락된 값에는 기본값을 적용하고 미정의 필드는 제거한다', () => {
    expect(noticeSearchSchema.parse({ tab: 'readers' })).toEqual({ category: 'all' });
  });
});
