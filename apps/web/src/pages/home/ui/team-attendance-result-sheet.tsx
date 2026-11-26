/**
 * 조회·저장 없이 결과를 표시합니다. 호출자는 실제 표시 기록과 후속 화면 이동을 담당합니다.
 * 반려 reason은 사진 조회 응답의 photo.rejectionReason이며 값이 없으면 사유 영역을 생략합니다.
 * 결석 사유는 현재 API에서 제공하지 않아 표시하지 않습니다. 개발 미리보기는 fixture를 사용합니다.
 */
import { useActivityZIndexBase } from '@seed-design/stackflow';
import { ActionButton, BottomSheetContent, BottomSheetRoot } from '@yapp-plus/ui';
import { useId } from 'react';
import { CompleteIllustration } from '@/shared/ui/complete-illustration';
import type { TeamAttendanceResult } from '../model/team-attendance-result';
import { sheetDescription, sheetHandleBar, sheetTitle } from './home-page.css';
import * as styles from './team-attendance-result-sheet.css';

const TITLES = {
  REJECTED: '팀 세션 인증이 반려됐어요',
  ABSENT: '결석으로 처리됐어요',
  COMPLETED: '팀 세션 출석이 완료됐어요!',
};
const DEADLINE_FORMAT = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function getResultDescription(result: TeamAttendanceResult): string {
  if (result.kind !== 'REJECTED') {
    return {
      COMPLETED: '운영진이 출석을 승인했어요',
      ABSENT: '확인이 필요하면 운영진에게 문의해 주세요',
    }[result.kind];
  }
  if (result.reupload === 'AVAILABLE') {
    return `${DEADLINE_FORMAT.format(result.deadline)} 전까지 다시 업로드해 주세요`;
  }
  return {
    EXPIRED: '재업로드 기한이 지났어요',
    UNAVAILABLE: '현재 다시 업로드할 수 없어요',
  }[result.reupload];
}

/** controlled 시트이며 후속 행동 전에 닫기를 요청합니다. 포커스 이동·복귀는 BottomSheet 기본 동작을 사용합니다. */
export function TeamAttendanceResultSheet({
  result,
  open,
  onOpenChange,
  onReupload,
  onContact,
  showSession = false,
}: {
  result: TeamAttendanceResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReupload: (sessionId: number) => void;
  onContact: () => void;
  showSession?: boolean;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const layerIndex = useActivityZIndexBase();
  const canReupload = result.kind === 'REJECTED' && result.reupload === 'AVAILABLE';
  const description = getResultDescription(result);
  function closeAndAct(action?: () => void) {
    onOpenChange(false);
    action?.();
  }
  return (
    <BottomSheetRoot open={open} onOpenChange={onOpenChange} lazyMount unmountOnExit>
      <BottomSheetContent
        layerIndex={layerIndex}
        className={styles.content}
        showCloseButton={false}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className={styles.handle} aria-hidden="true">
          <div className={sheetHandleBar} />
        </div>
        <div className={styles.body}>
          <div className={styles.heading}>
            <h2 id={titleId} className={sheetTitle}>
              {TITLES[result.kind]}
            </h2>
            <p id={descriptionId} className={sheetDescription}>
              {description}
            </p>
            {showSession && (
              <p className={sheetDescription}>
                {result.date} · {result.name}
              </p>
            )}
          </div>
          {result.kind === 'REJECTED' && result.reason && (
            <div className={styles.reason}>
              <img
                className={styles.notice}
                src="/images/team-attendance/result-notice.svg"
                width={22}
                height={22}
                alt=""
              />
              <p className={styles.reasonText}>사유: {result.reason}</p>
            </div>
          )}
          {result.kind === 'COMPLETED' && <CompleteIllustration className={styles.illustration} />}
        </div>
        <div className={styles.actions}>
          {result.kind === 'ABSENT' && (
            <ActionButton
              type="button"
              variant="neutralWeak"
              size="large"
              className={styles.button}
              onClick={() => closeAndAct(onContact)}
            >
              운영진에게 문의하기
            </ActionButton>
          )}
          <ActionButton
            type="button"
            variant="brandSolid"
            size="large"
            className={styles.button}
            onClick={() =>
              closeAndAct(canReupload ? () => onReupload(result.sessionId) : undefined)
            }
          >
            {canReupload ? '다시 업로드하기' : '확인'}
          </ActionButton>
        </div>
      </BottomSheetContent>
    </BottomSheetRoot>
  );
}
