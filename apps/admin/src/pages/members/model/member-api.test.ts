import { describe, expect, it } from 'vitest';
import { memberPositionOptions, memberStatusLabels, memberStatusOptions } from './member-api';

describe('회원관리 API enum 표시값', () => {
  it('백엔드 권한 enum과 표시명을 사용한다', () => {
    expect(memberStatusOptions).toEqual(['PLAYER', 'OB', 'COMPLETED_MEMBER', 'DEFERRED', 'STAFF']);
    expect(memberStatusLabels).toMatchObject({
      PLAYER: '활동회원',
      OB: '정회원',
      COMPLETED_MEMBER: '수료회원',
      DEFERRED: '유예회원',
      STAFF: '앱 운영진',
    });
  });

  it('백엔드 직군 enum 순서를 그대로 사용한다', () => {
    expect(memberPositionOptions).toEqual([
      'PM',
      'DESIGN',
      'ANDROID',
      'IOS',
      'WEB',
      'MOBILE',
      'SERVER',
      'AI_NATIVE',
    ]);
  });
});
