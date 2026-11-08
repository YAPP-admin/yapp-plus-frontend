/** 공지 상세 API 모델의 ID·응답 경계와 서울 마감일 계산을 검증한다. */
import { expect, it } from 'vitest';
import { noticeDeadlineLabel, noticeDetailSchema, noticeIdFromParam } from './notice-detail-query';

const response = {
  postId: '1',
  type: 'ASSIGNMENT',
  title: '과제',
  contentMarkdown: '# 안내',
  createdDate: '2026-11-07',
  assignment: {
    deadlineDate: '2026-11-09',
    positions: ['WEB'],
    submissionUrl: 'https://example.com',
    submissionLinkText: '제출하기',
  },
  images: [],
  readCount: '0',
  read: false,
};

it('상세 ID는 양의 안전한 정수만 허용한다', () => {
  expect(noticeIdFromParam('1')).toBe(1);
  expect(noticeIdFromParam('0')).toBeUndefined();
  expect(noticeIdFromParam('-1')).toBeUndefined();
  expect(noticeIdFromParam('1.5')).toBeUndefined();
  expect(noticeIdFromParam('9007199254740992')).toBeUndefined();
});

it('상세 응답의 bigint 값과 과제 본문을 화면 모델로 변환한다', async () => {
  await expect(noticeDetailSchema.parseAsync(response)).resolves.toMatchObject({
    postId: 1,
    readCount: 0,
    assignment: { positions: ['WEB'] },
  });
});

it('서울 날짜를 기준으로 마감일을 표시한다', () => {
  const now = Date.parse('2026-11-07T15:00:00Z');
  expect(noticeDeadlineLabel('2026-11-08', now)).toBe('D-day');
  expect(noticeDeadlineLabel('2026-11-09', now)).toBe('D-1');
  expect(noticeDeadlineLabel('2026-11-07', now)).toBe('D+1');
});
