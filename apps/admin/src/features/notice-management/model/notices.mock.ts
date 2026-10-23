/** 개발 브라우저에서만 사용하는 합성 명단과 메모리 저장소다. 새로고침하면 초기화된다. */
import {
  memberSchema,
  noticeContentSchema,
  noticeSchema,
  type Notice,
  type NoticeContent,
} from './notice';
import { getNoticeAudience, reconcileReadRecords } from './notice-audience';
import { NoticeError } from './notice-error';

const members = memberSchema.array().parse([
  { id: 'demo-web', name: '예시 웹회원', cohort: 30, job: 'Web', membership: 'active' },
  { id: 'demo-design', name: '예시 디자인회원', cohort: 30, job: 'Design', membership: 'active' },
  { id: 'demo-regular', name: '예시 정회원', cohort: 29, job: 'PM', membership: 'regular' },
  {
    id: 'demo-completed',
    name: '예시 수료회원',
    cohort: 28,
    job: 'Server',
    membership: 'completed',
  },
]);
const bodyDocument = {
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: '화면 검증용 예시 공지입니다.' }] },
  ],
};
const fixtures = noticeSchema.array().parse([
  {
    id: 'demo-session',
    category: 'session',
    title: '예시 세션 안내',
    bodyDocument,
    audience: 'all',
    createdAt: '2026-10-20T00:00:00.000Z',
    readAtByMemberId: { 'demo-web': '2026-10-20T01:00:00.000Z' },
    unansweredCount: 1,
  },
  {
    id: 'demo-submission',
    category: 'submission',
    title: '예시 제출 안내',
    bodyDocument,
    audience: 'all',
    submission: { deadlineAt: '2026-11-01T09:00:00.000Z', method: null },
    createdAt: '2026-10-21T00:00:00.000Z',
    readAtByMemberId: {},
    unansweredCount: 0,
  },
  {
    id: 'demo-operation',
    category: 'operation',
    title: '예시 운영 안내',
    bodyDocument,
    audience: 'completed',
    createdAt: '2026-10-22T00:00:00.000Z',
    readAtByMemberId: {},
    unansweredCount: 0,
  },
]);

/** 최신 작성일을 먼저 두고 같은 시각이면 ID로 순서를 고정한다. */
function compareCreatedNotices(a: Notice, b: Notice) {
  return Date.parse(b.createdAt) - Date.parse(a.createdAt) || a.id.localeCompare(b.id, 'en');
}

/** 초기 데이터와 반환값을 복제해 외부 변경이 저장 원본에 영향을 주지 않게 한다. */
export function createNoticeStore(initial: readonly Notice[] = fixtures) {
  let notices = structuredClone(noticeSchema.array().parse(initial));

  /** 현재 공지를 찾고 없으면 생성으로 대체하지 않고 오류를 반환한다. */
  function requireNotice(id: string) {
    const notice = notices.find((item) => item.id === id);
    if (!notice) {
      throw new NoticeError('not-found', '공지를 찾을 수 없습니다.');
    }
    return notice;
  }

  return {
    /** 상세의 대상 계산에 사용할 전체 합성 명단을 반환한다. */
    listMembers() {
      return structuredClone(members);
    },
    /** 작성일 내림차순, 동률 ID순으로 전체 공지를 반환한다. */
    listNotices() {
      return structuredClone(notices.toSorted(compareCreatedNotices));
    },
    /** 없는 공지는 null이며 조회 오류와 구별된다. */
    getNotice(id: string) {
      return structuredClone(notices.find((item) => item.id === id) ?? null);
    },
    /** 모든 계산과 복제가 성공한 뒤 한 번에 반영한다. 새 대상은 전원 미열람이다. */
    createNotice(input: NoticeContent) {
      const content = noticeContentSchema.parse(input);
      const notice = structuredClone(
        noticeSchema.parse({
          ...content,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          readAtByMemberId: reconcileReadRecords({}, [], getNoticeAudience(content, members)),
          unansweredCount: 0,
        }),
      );
      const result = structuredClone(notice);
      notices = [...notices, notice];
      return result;
    },
    /** 작성일·질문 수와 대상 교집합의 읽음 기록을 유지하며 성공 직전에 원본을 교체한다. */
    updateNotice(id: string, input: NoticeContent) {
      const previous = requireNotice(id);
      const content = noticeContentSchema.parse(input);
      const notice = structuredClone(
        noticeSchema.parse({
          ...content,
          id: previous.id,
          createdAt: previous.createdAt,
          unansweredCount: previous.unansweredCount,
          readAtByMemberId: reconcileReadRecords(
            previous.readAtByMemberId,
            getNoticeAudience(previous, members),
            getNoticeAudience(content, members),
          ),
        }),
      );
      const result = structuredClone(notice);
      notices = notices.map((item) => (item.id === id ? notice : item));
      return result;
    },
    /** 존재하는 대상 공지만 삭제한다. */
    deleteNotice(id: string) {
      requireNotice(id);
      notices = notices.filter((item) => item.id !== id);
    },
  };
}

let browserStore: ReturnType<typeof createNoticeStore> | undefined;

/** 같은 개발 브라우저 모듈 안에서는 저장소를 재사용하고 SSR·프로덕션 접근을 거절한다. */
export function getBrowserNoticeStore() {
  if (!import.meta.env.DEV || import.meta.env.SSR || typeof window === 'undefined') {
    throw new NoticeError('unavailable', '공지 관리 기능을 준비 중입니다.');
  }
  browserStore ??= createNoticeStore();
  return browserStore;
}
