/** 모의 저장소의 지연 로딩과 실행 환경·입출력·오류 경계를 담당한다. */
import { z } from 'zod';
import { memberSchema, noticeSchema, type NoticeContent } from './notice';
import { NoticeError } from './notice-error';
import type { createNoticeStore } from './notices.mock';

type Store = ReturnType<typeof createNoticeStore>;

/** 개발 브라우저에서만 저장소를 불러오고 실패 원인을 화면용 오류로 통일한다. */
async function withStore<T>(operation: (store: Store) => T): Promise<T> {
  if (!import.meta.env.DEV || import.meta.env.SSR || typeof window === 'undefined') {
    throw new NoticeError('unavailable', '공지 관리 기능을 준비 중입니다.');
  }
  try {
    const { getBrowserNoticeStore } = await import('./notices.mock');
    return operation(getBrowserNoticeStore());
  } catch (error) {
    if (error instanceof NoticeError) {
      throw error;
    }
    throw new NoticeError(
      error instanceof z.ZodError ? 'validation' : 'unknown',
      error instanceof z.ZodError
        ? '공지 입력을 확인하세요.'
        : '공지 처리에 실패했습니다. 다시 시도해 주세요.',
      { cause: error },
    );
  }
}

/** 전체 합성 명단을 조회한다. */
export const listNoticeMembers = () =>
  withStore((store) => memberSchema.array().parse(store.listMembers()));

/** 전체 공지를 조회한다. 필터와 개수는 같은 결과에서 파생한다. */
export const listNotices = () =>
  withStore((store) => noticeSchema.array().parse(store.listNotices()));

/** 상세 공지를 조회하며 없는 ID는 null을 반환한다. */
export const getNotice = (id: string) =>
  withStore((store) => noticeSchema.nullable().parse(store.getNotice(id)));

/** 폼에서 정규화한 입력을 저장하고 생성된 공지를 반환한다. */
export const createNotice = (input: NoticeContent) =>
  withStore((store) => noticeSchema.parse(store.createNotice(input)));

/** 같은 ID의 공지를 수정한다. 없는 ID는 오류다. */
export const updateNotice = (id: string, input: NoticeContent) =>
  withStore((store) => noticeSchema.parse(store.updateNotice(id, input)));

/** 공지를 삭제한다. 없는 ID는 오류다. */
export const deleteNotice = (id: string) => withStore((store) => store.deleteNotice(id));
