/** 사진 웹 RPC 연결과 통신 실패 정규화만 확인한다. 파일 규칙은 photo.test.ts가 담당한다. */
import { afterEach, expect, it, vi } from 'vitest';
import { pickAttendancePhoto } from '../src/web';

const native = vi.hoisted(() => ({ pickAttendancePhoto: vi.fn<() => Promise<unknown>>() }));
vi.mock('@webview-bridge/web', () => ({ linkBridge: () => native }));
afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

it('일반 브라우저에서는 native 사진 RPC를 호출하지 않는다', async () => {
  vi.stubGlobal('window', {});
  expect(await pickAttendancePhoto({ source: 'library' })).toEqual({
    status: 'ERROR',
    code: 'PROCESSING_FAILED',
  });
  expect(native.pickAttendancePhoto).not.toHaveBeenCalled();
});

it('선택 경로를 전달하고 native 취소 응답을 유지한다', async () => {
  vi.stubGlobal('window', { ReactNativeWebView: {} });
  native.pickAttendancePhoto.mockResolvedValue({ status: 'CANCELLED', raw: 'private' });
  expect(await pickAttendancePhoto({ source: 'camera' })).toEqual({ status: 'CANCELLED' });
  expect(native.pickAttendancePhoto).toHaveBeenCalledWith({ source: 'camera' });
});

it.each(['invalid', 'throw'])('잘못된 응답·통신 예외를 정규화한다: %s', async (failure) => {
  vi.stubGlobal('window', { ReactNativeWebView: {} });
  if (failure === 'throw') {
    native.pickAttendancePhoto.mockRejectedValue(new Error('private'));
  } else {
    native.pickAttendancePhoto.mockResolvedValue({ status: 'SUCCESS' });
  }
  expect(await pickAttendancePhoto({ source: 'library' })).toEqual({
    status: 'ERROR',
    code: 'PROCESSING_FAILED',
  });
});
