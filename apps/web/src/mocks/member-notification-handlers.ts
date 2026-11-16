/** 알림함 화면의 개발·테스트용 목록 응답을 생성 API 경로에 연결한다. */
import type { UserNotificationListItemResponse } from '@yapp-plus/api/generated';
import { createMswHandlers } from '@yapp-plus/api/generated/msw';
import { HttpResponse } from 'msw';

export const memberNotificationFixture = [
  {
    id: 3,
    content: '새 공지가 올라왔어요. 게시판을 확인해 주세요.',
    sentDate: '2026-11-07',
    type: 'POST',
    postId: 2,
  },
  {
    id: 2,
    content: '내일 오후 2시, 정기 세션이 열려요.',
    sentDate: '2026-11-06',
    type: 'GENERAL',
    postId: null,
  },
  {
    id: 1,
    content: '이번 주 세션은 3층 세미나실에서 진행해요.',
    sentDate: '2026-11-05',
    type: 'GENERAL',
    postId: null,
  },
] satisfies UserNotificationListItemResponse[];

/** cursor 기반으로 다음 알림 fixture 페이지를 반환한다. */
export function createMemberNotificationHandlers(baseUrl: string) {
  const { pick } = createMswHandlers({ baseUrl });
  return [
    pick.find3(({ request }) => {
      const cursor = new URL(request.url).searchParams.get('cursor');
      const start = cursor === null ? 0 : Number(cursor);
      if (!Number.isSafeInteger(start) || start < 0) {
        return HttpResponse.json(
          { code: 'INVALID_NOTIFICATION_CURSOR', message: '개발용 알림 커서 오류' },
          { status: 400 },
        );
      }
      const items = memberNotificationFixture.slice(start, start + 2);
      return HttpResponse.json({
        items,
        nextCursor:
          start + items.length < memberNotificationFixture.length
            ? String(start + items.length)
            : null,
      });
    }),
  ];
}
