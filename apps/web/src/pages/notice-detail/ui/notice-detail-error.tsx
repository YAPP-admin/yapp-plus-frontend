/** 공지 상세 초기 조회 실패를 해당 화면 안에서 재시도 가능하게 처리한다. */
import { ErrorState } from '@/shared/ui/error-state';
import { container } from './notice-detail-page.css';
import { NoticeDetailHeader } from './notice-detail-header';

/** Activity의 Query 오류 재설정 동작을 다시 시도 버튼에 연결합니다. */
export function NoticeDetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <>
      <NoticeDetailHeader categoryLabel="공지사항" />
      <main className={container}>
        <ErrorState variant="page" title="공지 상세를 불러오지 못했어요" onRetry={onRetry} />
      </main>
    </>
  );
}
