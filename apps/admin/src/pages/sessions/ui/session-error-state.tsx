/** 조회 실패와 재시도 상태를 SEED ResultSection과 ProgressCircle로 표시합니다. */
import { ProgressCircle } from '@seed-design/react';
import { ResultSection } from '~/shared/ui/result-section';
import { panel } from './session-state.css';

export function SessionErrorState({
  retrying,
  onRetry,
}: {
  retrying: boolean;
  onRetry: () => void;
}) {
  return (
    <section className={panel} aria-label="세션 조회 실패" role="alert">
      <ResultSection
        asset={
          retrying && (
            <ProgressCircle.Root size="24" aria-label="다시 불러오는 중">
              <ProgressCircle.Track />
              <ProgressCircle.Range />
            </ProgressCircle.Root>
          )
        }
        title="세션 목록을 불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요."
        primaryActionProps={{
          children: retrying ? '다시 불러오는 중' : '다시 시도',
          disabled: retrying,
          onClick: onRetry,
        }}
      />
    </section>
  );
}
