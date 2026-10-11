import { describe, expect, it } from 'vitest';
import {
  attendancePartSchema,
  attendanceSearchSchema,
  attendanceSessionSearchSchema,
} from './attendance-search';

describe('출석 쿼리', () => {
  it.each(attendancePartSchema.options)('%s를 모든 출석 화면에서 허용한다', (part) => {
    expect(attendanceSearchSchema.parse({ part })).toEqual({ part });
    expect(attendanceSessionSearchSchema.parse({ part })).toEqual({ part });
  });
  it('common은 세션 선택 화면에서만 허용한다', () => {
    expect(attendanceSessionSearchSchema.parse({ part: 'common' })).toEqual({ part: 'common' });
    expect(attendanceSearchSchema.parse({ part: 'common' })).toEqual({ part: 'all' });
  });
  it.each([undefined, null, '', 'unknown', 'WEB', 1, true, ['web'], { part: 'web' }])(
    '잘못된 값 %j를 모든 직군으로 처리한다',
    (part) => {
      expect(attendanceSearchSchema.parse({ part })).toEqual({ part: 'all' });
      expect(attendanceSessionSearchSchema.parse({ part })).toEqual({ part: 'all' });
    },
  );
});
