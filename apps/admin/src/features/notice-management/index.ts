/** 공지 화면에서 사용하는 타입·편집기·Query 훅만 공개한다. 모의 저장소는 내부에 둔다. */
export { NoticeEditor } from './ui/notice-editor';
export type { Member, Notice, NoticeContent } from './model/notice';
export { NoticeError } from './model/notice-error';
export {
  useNoticesQuery,
  useNoticeQuery,
  useNoticeMembersQuery,
  useNoticeMutations,
} from './model/notice-queries';
