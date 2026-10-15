import { describe, expect, it } from 'vitest';
import { sessionFilterSchema, sessionSearchSchema } from './session-search';

describe('세션 유형 쿼리', () => {
  it.each(sessionFilterSchema.options)('%s를 유지한다', (type) => {
    expect(sessionSearchSchema.parse({ type })).toEqual({ type });
  });

  it.each([undefined, null, '', 'unknown', 'OFFLINE', 1, true, ['team'], { type: 'team' }])(
    '잘못된 외부 입력 %j를 전체로 처리한다',
    (type) => {
      expect(sessionSearchSchema.parse({ type })).toEqual({ type: 'all' });
    },
  );

  it('예전 직군 조건을 무시하고 유효한 유형만 사용한다', () => {
    expect(sessionSearchSchema.parse({ part: 'web', page: 2 })).toEqual({ type: 'all' });
    expect(sessionSearchSchema.parse({ type: 'team', part: 'web' })).toEqual({ type: 'team' });
  });
});
