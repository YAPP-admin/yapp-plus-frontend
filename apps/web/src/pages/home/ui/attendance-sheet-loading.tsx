/** 출석 시트의 조회 대기 영역을 실제 입력 없이 표시합니다. */
import { HStack, Skeleton, VStack } from '@seed-design/react';
import { skeletonPlaceholder } from '@/shared/ui/skeleton.css';
import type { AttendanceReportStep } from './attendance-report-sheet';
import { sheetContainer, sheetTitle, sheetDescription } from './home-page.css';

/** 네 자리 코드와 확인 버튼의 공간을 예약합니다. */
export function AttendanceCodeLoading() {
  return (
    <VStack
      as="section"
      className={sheetContainer}
      gap="x5"
      aria-label="출석 코드를 준비하고 있어요"
      aria-busy="true"
    >
      <HStack gap="x1_5" justify="center" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className={skeletonPlaceholder} width="54px" height="54px" />
        ))}
      </HStack>
      <Skeleton className={skeletonPlaceholder} width="full" height="52px" aria-hidden="true" />
    </VStack>
  );
}

/** 보고 단계의 제목·설명은 읽을 수 있게 두고 선택·입력 윤곽만 숨깁니다. */
export function AttendanceReportLoading({ step }: { step: AttendanceReportStep }) {
  return (
    <VStack className={sheetContainer} gap="x5">
      <VStack gap="x1_5">
        <h2 className={sheetTitle}>
          {step === 'type' ? '출결을 보고해 주세요' : '사유를 입력해 주세요'}
        </h2>
        <p className={sheetDescription}>
          {step === 'type'
            ? '미리 알려주시면 점수 차감이 줄어들어요.'
            : '사유는 30자 이내로 입력해 주세요.'}
        </p>
      </VStack>
      <VStack as="section" gap="x3" aria-label="출결 보고를 준비하고 있어요" aria-busy="true">
        {Array.from({ length: step === 'type' ? 3 : 1 }, (_, index) => (
          <Skeleton
            key={index}
            className={skeletonPlaceholder}
            width="full"
            height="52px"
            aria-hidden="true"
          />
        ))}
        <Skeleton className={skeletonPlaceholder} width="full" height="52px" aria-hidden="true" />
      </VStack>
    </VStack>
  );
}
