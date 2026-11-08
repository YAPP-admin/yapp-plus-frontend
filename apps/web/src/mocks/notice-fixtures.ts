import type { UserPostDetailResponse } from '@yapp-plus/api/generated';
import type { SessionFixtures } from './session-fixtures';

export function createNoticeFixtures(fixtures: SessionFixtures) {
  const { weekStartDate } = fixtures.currentWeekFixture;
  const session = fixtures.scheduleFixture.sessions[0];
  if (!session) {
    throw new Error('공지에 연결할 세션이 없습니다.');
  }
  return [
    {
      postId: 39901,
      type: 'SESSION',
      title: `${session.name} 안내`,
      createdDate: weekStartDate,
      contentMarkdown: [
        '# 정규 세션 안내',
        `- 일정: ${session.date} ${session.startTime.slice(0, 5)}~18:00`,
        `- 장소: ${session.location}`,
        '세션 시작 전에 도착해 주세요. 개인 노트북과 충전기를 준비해 주세요.',
      ].join('\n\n'),
      assignment: null,
      images: [],
      readCount: 0,
      read: false,
    },
    {
      postId: 39902,
      type: 'OPERATION',
      title: '정규 세션 참여 안내',
      createdDate: weekStartDate,
      contentMarkdown: [
        '# 정규 세션 참여 안내',
        '일정 탭에서 정규 세션의 날짜와 장소를 확인할 수 있습니다.',
        '세션 당일 운영진의 안내에 따라 출석해 주세요.',
      ].join('\n\n'),
      assignment: null,
      images: [],
      readCount: 0,
      read: false,
    },
  ] satisfies UserPostDetailResponse[];
}
