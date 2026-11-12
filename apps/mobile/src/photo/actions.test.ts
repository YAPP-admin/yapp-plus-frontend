/** 사진 작업 잠금·입력 차단·예외 정규화를 검증한다. 스키마 세부 규칙은 공용 계약에서 검증한다. */
import { expect, it, vi } from 'vitest';
import { createPhotoActions, type PhotoRuntime } from './actions';

it('잘못된 RPC 입력으로 OS 선택기를 열지 않는다', async () => {
  const prepare = vi.fn<PhotoRuntime['prepare']>();
  expect(await createPhotoActions({ prepare }).pickAttendancePhoto({ source: 'files' })).toEqual({
    status: 'ERROR',
    code: 'INVALID_INPUT',
  });
  expect(prepare).not.toHaveBeenCalled();
});

it.each(['cancel', 'throw'])(
  '진행 중 호출은 BUSY이며 %s 이후에는 다시 선택할 수 있다',
  async (end) => {
    const pending = Promise.withResolvers<unknown>();
    const prepare = vi
      .fn<PhotoRuntime['prepare']>()
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValue({ status: 'CANCELLED' });
    const { pickAttendancePhoto } = createPhotoActions({ prepare });
    const first = pickAttendancePhoto({ source: 'library' });
    expect(await pickAttendancePhoto({ source: 'camera' })).toEqual({
      status: 'ERROR',
      code: 'BUSY',
    });
    expect(prepare).toHaveBeenCalledTimes(1);
    if (end === 'cancel') {
      pending.resolve({ status: 'CANCELLED' });
    } else {
      pending.reject(new Error('private path'));
    }
    expect(await first).toEqual(
      end === 'cancel' ? { status: 'CANCELLED' } : { status: 'ERROR', code: 'PROCESSING_FAILED' },
    );
    expect(await pickAttendancePhoto({ source: 'camera' })).toEqual({ status: 'CANCELLED' });
  },
);

it('런타임의 잘못된 성공 응답을 전달하지 않는다', async () => {
  const prepare = vi
    .fn<PhotoRuntime['prepare']>()
    .mockResolvedValue({ status: 'SUCCESS', photo: { uri: 'file:///private' } });
  expect(await createPhotoActions({ prepare }).pickAttendancePhoto({ source: 'library' })).toEqual({
    status: 'ERROR',
    code: 'PROCESSING_FAILED',
  });
});
