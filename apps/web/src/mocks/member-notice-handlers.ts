import type { UserPostListItemResponse, UserPostListResponse } from '@yapp-plus/api/generated';
import { createMswHandlers } from '@yapp-plus/api/generated/msw';
import { delay, HttpResponse } from 'msw';

const notices = [
  ['SESSION', '6주차 세션 안내', '2026-11-07', null],
  ['ASSIGNMENT', '사용자 테스트 결과 제출', '2026-11-06', 2],
  ['OPERATION', '운영진 전달 사항', '2026-11-05', null],
  ['ASSIGNMENT', '프로젝트 중간 점검', '2026-11-04', 0],
  ['SESSION', '5주차 세션 안내', '2026-10-31', null],
  ['OPERATION', '분과 모임 안내', '2026-10-30', null],
  ['ASSIGNMENT', '데모 발표 자료 제출', '2026-10-29', -1],
  ['SESSION', '4주차 세션 안내', '2026-10-24', null],
  ['OPERATION', '행사 장소 변경', '2026-10-23', null],
  ['ASSIGNMENT', '팀 회고 작성', '2026-10-22', 7],
  ['SESSION', '3주차 세션 안내', '2026-10-17', null],
  ['OPERATION', '운영 정책 안내', '2026-10-16', null],
] as const satisfies readonly (readonly [
  UserPostListItemResponse['type'],
  string,
  string,
  number | null,
])[];

export const memberNoticeFixture = notices.map(
  ([type, title, createdDate, daysUntilDeadline], index) =>
    ({
      postId: index + 1,
      type,
      title,
      createdDate,
      daysUntilDeadline,
    }) satisfies UserPostListItemResponse,
);

export function createMemberNoticeHandlers(baseUrl: string, noticeState?: string | null) {
  let failNextRequest = noticeState === 'error' || noticeState === 'next-error';
  const { pick } = createMswHandlers({ baseUrl });
  return [
    pick.list1(async ({ request }) => {
      const url = new URL(request.url);
      const cursor = url.searchParams.get('cursor');
      const type = url.searchParams.get('type') ?? 'ALL';
      if (noticeState === 'loading') {
        await delay(5_000);
      }
      if (failNextRequest && (noticeState === 'error' || cursor !== null)) {
        failNextRequest = false;
        return HttpResponse.json(
          { code: 'NOTICE_UNAVAILABLE', message: '개발용 공지 조회 실패' },
          { status: 500 },
        );
      }
      if (!['ALL', 'SESSION', 'ASSIGNMENT', 'OPERATION'].includes(type)) {
        return HttpResponse.json(
          { code: 'INVALID_POST_REQUEST', message: '개발용 공지 유형 오류' },
          { status: 400 },
        );
      }
      const source =
        noticeState === 'weekly' ? memberNoticeFixture.slice(0, 4) : memberNoticeFixture;
      const filtered =
        noticeState === 'empty'
          ? []
          : source.filter((notice) => type === 'ALL' || notice.type === type);
      const start = cursor === null ? 0 : Number(cursor);
      if (!Number.isSafeInteger(start) || start < 0) {
        return HttpResponse.json(
          { code: 'INVALID_POST_CURSOR', message: '개발용 공지 커서 오류' },
          { status: 400 },
        );
      }
      const items = filtered.slice(start, start + 4);
      const response = {
        totalPostCount: filtered.length,
        items,
        nextCursor: start + 4 < filtered.length ? String(start + 4) : null,
      } satisfies UserPostListResponse;
      return HttpResponse.json(response);
    }),
  ];
}
