/** 개발 화면에서만 공통 오류 UI를 검토한다. 업무 요청이나 실제 오류를 발생시키지 않는다. */
import { useState } from 'react';
import { ErrorState } from '../../../shared/ui/error-state';

/** 재시도 이벤트 수신만 표시하며 서버 조회·복구를 모사하지 않는다. */
export function ErrorStatePreview() {
  const [count, setCount] = useState(0);
  const onRetry = () => setCount((value) => value + 1);
  return (
    <section>
      <h2>공통 오류 안내 미리보기</h2>
      <output>재시도 액션 호출: {count}회</output>
      <ErrorState variant="page" titleAs="h3" onRetry={onRetry} />
      <ErrorState
        variant="section"
        titleAs="h3"
        title="프로필을 불러오지 못했어요"
        onRetry={onRetry}
      />
      <ErrorState
        variant="section"
        titleAs="h3"
        title="이번 주에 예정된 세션과 공지 정보를 불러오지 못했어요"
        description="네트워크 연결 상태를 확인한 뒤 잠시 후 다시 시도해 주세요."
        onRetry={onRetry}
      />
      <ErrorState
        variant="page"
        titleAs="h3"
        onRetry={onRetry}
        retryLabel="새로고침"
        secondaryAction={{ label: '홈으로 이동', href: '/' }}
      />
    </section>
  );
}
