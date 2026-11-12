/** 사진 RPC 입력·응답을 검증하고 한 번에 하나의 OS 사진 작업만 허용한다. */
import {
  pickAttendancePhotoInputSchema,
  pickAttendancePhotoResultSchema,
  type PickAttendancePhotoInput,
  type PickAttendancePhotoResult,
} from '@yapp-plus/app-bridge';

/** OS 선택·변환·정리를 하나의 작업으로 주입한다. 반환값은 RPC 경계에서 검증한다. */
export type PhotoRuntime = {
  prepare: (source: PickAttendancePhotoInput['source']) => Promise<unknown>;
};

/** 앱에서 한 번 생성한다. 웹 timeout 이후에도 OS 작업이 끝날 때까지 잠금을 유지한다. */
export const createPhotoActions = (runtime: PhotoRuntime) => {
  let isPhotoOperationInProgress = false;
  return {
    /** 취소·실패에는 사진을 반환하지 않는다. 원문 예외는 경계를 넘기지 않는다. */
    async pickAttendancePhoto(this: void, input: unknown): Promise<PickAttendancePhotoResult> {
      const parsed = pickAttendancePhotoInputSchema.safeParse(input);
      if (!parsed.success) {
        return { status: 'ERROR', code: 'INVALID_INPUT' };
      }
      // 사진 선택을 대기열에 쌓으면 이전 선택 직후 다시 열리므로 추가 호출은 즉시 거절한다.
      // 첫 await 전에 상태를 바꿔 같은 실행 구간의 추가 호출도 거절한다.
      if (isPhotoOperationInProgress) {
        return { status: 'ERROR', code: 'BUSY' };
      }
      isPhotoOperationInProgress = true;
      try {
        return pickAttendancePhotoResultSchema.parse(await runtime.prepare(parsed.data.source));
      } catch {
        // OS 예외·잘못된 응답 모두 정규화한다. 원문 오류에는 사진 데이터나 경로가 포함될 수 있다.
        return { status: 'ERROR', code: 'PROCESSING_FAILED' };
      } finally {
        isPhotoOperationInProgress = false;
      }
    },
  };
};
