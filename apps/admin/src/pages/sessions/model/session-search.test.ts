import { describe, expect, it } from 'vitest';
import { sessionPartSchema, sessionSearchSchema } from './session-search';

describe('세션 직군 쿼리', () => {
  it.each(sessionPartSchema.options)('%s를 유지한다', (part) => {
    expect(sessionSearchSchema.parse({ part })).toEqual({ part });
  });
  it.each([undefined, null, '', 'unknown', 'WEB', 1, true, ['web'], { part: 'web' }])(
    '잘못된 외부 입력 %j를 기본값으로 처리한다',
    (part) => {
      expect(sessionSearchSchema.parse({ part })).toEqual({ part: 'all' });
    },
  );
  it('누락된 값에는 기본값을 적용하고 미정의 필드는 제거한다', () => {
    expect(sessionSearchSchema.parse({ page: 2 })).toEqual({ part: 'all' });
  });
});
