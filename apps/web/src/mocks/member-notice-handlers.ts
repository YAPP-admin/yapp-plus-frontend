import type {
  UserPostDetailResponse,
  UserPostListItemResponse,
  UserPostListResponse,
} from '@yapp-plus/api/generated';
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

export const memberNoticeDetailFixture = {
  postId: 2,
  type: 'ASSIGNMENT',
  title: '사용자 테스트 결과 제출',
  contentMarkdown:
    '# 제출 안내\n\n기한 안에 과제를 제출해 주세요.\n\n- 테스트 결과 정리\n- 회고 작성',
  createdDate: '2026-11-07',
  assignment: {
    deadlineDate: '2026-11-09',
    positions: ['WEB', 'ANDROID'],
    submissionUrl: 'https://example.com/submissions',
    submissionLinkText: '제출 페이지',
  },
  images: [
    {
      imageKey: 'notice-1-image',
      filename: 'assignment-guide.png',
      contentType: 'image/png',
      sizeBytes: 1_024,
      displayOrder: 1,
      readUrl: 'https://images.example.com/notice-1.png',
      readUrlExpiresAt: '2026-11-08T01:00:00Z',
    },
  ],
  readCount: 13,
  read: false,
} satisfies UserPostDetailResponse;

const resetMemberNoticeHandlers = new Set<() => void>();

/** 테스트 종료마다 개발용 읽음 상태를 초기 fixture 값으로 되돌린다. */
export function resetMemberNoticeHandlerState() {
  resetMemberNoticeHandlers.forEach((reset) => reset());
}

function memberNoticeDetail(postId: number): UserPostDetailResponse | undefined {
  const notice = memberNoticeFixture.find((item) => item.postId === postId);
  if (!notice) {
    return undefined;
  }
  if (postId === memberNoticeDetailFixture.postId) {
    return memberNoticeDetailFixture;
  }
  return {
    ...memberNoticeDetailFixture,
    postId,
    type: notice.type,
    title: notice.title,
    createdDate: notice.createdDate,
    assignment: notice.type === 'ASSIGNMENT' ? memberNoticeDetailFixture.assignment : null,
    images: [],
  };
}

export function createMemberNoticeHandlers(baseUrl: string, noticeState?: string | null) {
  let failNextRequest = noticeState === 'error' || noticeState === 'next-error';
  let read = false;
  resetMemberNoticeHandlers.add(() => {
    failNextRequest = noticeState === 'error' || noticeState === 'next-error';
    read = false;
  });
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
    pick.detail2(({ params }) => {
      if (noticeState === 'detail-error' || noticeState === 'detail-unavailable') {
        return HttpResponse.json(
          {
            code: noticeState === 'detail-error' ? 'POST_NOT_FOUND' : 'NOTICE_UNAVAILABLE',
            message: '개발용 공지 상세 조회 실패',
          },
          { status: noticeState === 'detail-error' ? 404 : 503 },
        );
      }
      const detail = memberNoticeDetail(Number(params.postId));
      if (!detail) {
        return HttpResponse.json(
          { code: 'POST_NOT_FOUND', message: '개발용 공지 상세 없음' },
          { status: 404 },
        );
      }
      return HttpResponse.json({ ...detail, read });
    }),
    pick.acknowledge(({ params }) => {
      if (noticeState === 'read-error') {
        return HttpResponse.json(
          { code: 'NOTICE_UNAVAILABLE', message: '개발용 읽음 저장 실패' },
          { status: 503 },
        );
      }
      if (!memberNoticeDetail(Number(params.postId))) {
        return HttpResponse.json(
          { code: 'POST_NOT_FOUND', message: '개발용 공지 상세 없음' },
          { status: 404 },
        );
      }
      read = true;
      return new HttpResponse(null, { status: 204 });
    }),
  ];
}
