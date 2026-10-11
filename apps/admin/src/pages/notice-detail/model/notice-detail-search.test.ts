import { describe, expect, it } from 'vitest';
import { noticeDetailSearchSchema } from './notice-detail-search';

describe('공지 상세 탭 쿼리', () => {
  it.each(['readers', 'questions'])('%s를 유지한다', (tab) => {
    expect(noticeDetailSearchSchema.parse({ tab })).toEqual({ tab });
  });

  it.each([undefined, null, '', 'unknown', 1, true, ['questions'], { tab: 'questions' }])(
    '잘못된 입력 %j는 읽음 탭으로 처리한다',
    (tab) => {
      expect(noticeDetailSearchSchema.parse({ tab })).toEqual({ tab: 'readers' });
    },
  );

  it('누락된 탭은 기본값을 적용하고 목록 필터는 제거한다', () => {
    expect(noticeDetailSearchSchema.parse({ category: 'session' })).toEqual({ tab: 'readers' });
  });
});
