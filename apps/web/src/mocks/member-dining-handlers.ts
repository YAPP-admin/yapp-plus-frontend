/** 개발 브라우저에서 회식 목록·상세 탐색을 확인하는 읽기 전용 API 응답입니다. */
import type { AppAfterpartyDetailResponse } from '@yapp-plus/api/generated';
import { createMswHandlers } from '@yapp-plus/api/generated/msw';
import { HttpResponse } from 'msw';

/** 생성 시각을 기준으로 모집 중·마감·종료 상태를 제공하며 신청 저장은 모킹하지 않습니다. */
export function createMemberDiningHandlers(baseUrl: string) {
  const now = Date.now();
  const day = 86_400_000;
  const date = (days: number) => new Date(now + days * day).toISOString();
  const dinings = (
    [
      {
        afterpartyId: 1,
        title: '세션 뒤풀이',
        state: 'OPEN',
        response: 'UNANSWERED',
        startsAt: date(3),
        deadline: date(2),
      },
      {
        afterpartyId: 2,
        title: '팀 교류 뒤풀이',
        state: 'CLOSED',
        response: 'ATTENDING',
        startsAt: date(1),
        deadline: date(-1),
      },
      {
        afterpartyId: 3,
        title: '지난 세션 뒤풀이',
        state: 'ENDED',
        response: 'NOT_ATTENDING',
        startsAt: date(-3),
        deadline: date(-4),
      },
    ] satisfies Omit<AppAfterpartyDetailResponse, 'attendingCount'>[]
  ).map((item) => ({
    ...item,
    content: '세션 종료 후 함께 식사해요. 자세한 장소는 공지를 확인해 주세요.',
    attendingCount: 7,
  })) satisfies AppAfterpartyDetailResponse[];
  const factory = createMswHandlers({ baseUrl });
  return [
    factory.pick.list4(({ request }) => {
      const filter = new URL(request.url).searchParams.get('filter');
      const items = dinings
        .filter((item) => !filter || filter === 'ALL' || item.state === filter)
        .map(({ afterpartyId, title, startsAt, deadline, state }) => ({
          afterpartyId,
          title,
          startsAt,
          deadline,
          state,
          respondedCount: 9,
        }));
      return HttpResponse.json({ items, nextCursor: null });
    }),
    factory.pick.detail4(({ params }) => {
      const dining = dinings.find((item) => String(item.afterpartyId) === params.afterpartyId);
      return dining ? HttpResponse.json(dining) : new HttpResponse(null, { status: 404 });
    }),
  ];
}
