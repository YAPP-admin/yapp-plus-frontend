/** 사진 RPC의 웹 경계다. 응답을 검증하고 사진 바이트를 캐시하거나 기록하지 않는다. */
import type { AppBridgeState } from './index';
import {
  pickAttendancePhotoInputSchema,
  pickAttendancePhotoResultSchema,
  type PickAttendancePhotoInput,
  type PickAttendancePhotoResult,
} from './photo';

/** 브리지는 호출 시 연결한다. 일반 브라우저의 사진 입력은 화면이 별도로 담당한다. */
export const createWebPhotoActions = (
  getBridge: () => Pick<AppBridgeState, 'pickAttendancePhoto'>,
) => ({
  /** 화면 이탈 후 응답을 무시하고 취소 시 기존 선택을 유지하는 책임은 호출자에게 있다. */
  async pickAttendancePhoto(
    this: void,
    input: PickAttendancePhotoInput,
  ): Promise<PickAttendancePhotoResult> {
    const parsed = pickAttendancePhotoInputSchema.safeParse(input);
    if (!parsed.success) {
      return { status: 'ERROR', code: 'INVALID_INPUT' };
    }
    const failure = { status: 'ERROR', code: 'PROCESSING_FAILED' } as const;
    if (typeof window === 'undefined' || !('ReactNativeWebView' in window)) {
      return failure;
    }
    try {
      const result = pickAttendancePhotoResultSchema.safeParse(
        await getBridge().pickAttendancePhoto(parsed.data),
      );
      return result.success ? result.data : failure;
    } catch {
      return failure;
    }
  },
});
