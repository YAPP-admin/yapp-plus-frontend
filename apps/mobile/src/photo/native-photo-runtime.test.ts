/** Expo 연결 설정·권한 흐름·응답 전 파일 정리를 검증한다. 실제 이미지 변환은 실기기에서 확인한다. */
import { beforeEach, expect, it, vi } from 'vitest';
import { photoActions } from './native-photo-runtime';

const native = vi.hoisted(() => ({
  permission: vi.fn<() => Promise<unknown>>(),
  request: vi.fn<() => Promise<unknown>>(),
  library: vi.fn<() => Promise<unknown>>(),
  camera: vi.fn<() => Promise<unknown>>(),
  manipulate: vi.fn<() => unknown>(),
  render: vi.fn<() => Promise<unknown>>(),
  save: vi.fn<() => Promise<unknown>>(),
  read: vi.fn<() => Promise<string>>(),
  remove: vi.fn<(uri: string) => void>(),
  releaseImage: vi.fn<() => void>(),
  releaseContext: vi.fn<() => void>(),
  size: 4,
}));
vi.mock('expo-image-picker', () => ({
  getCameraPermissionsAsync: native.permission,
  requestCameraPermissionsAsync: native.request,
  launchImageLibraryAsync: native.library,
  launchCameraAsync: native.camera,
  UIImagePickerPreferredAssetRepresentationMode: { Current: 'current' },
}));
vi.mock('expo-image-manipulator', () => ({
  ImageManipulator: { manipulate: native.manipulate },
  SaveFormat: { JPEG: 'jpeg' },
}));
vi.mock('expo-file-system', () => ({
  Paths: { cache: { uri: 'file:///cache/' } },
  File: class {
    constructor(public uri: string) {}
    get size() {
      return native.size;
    }
    exists = true;
    base64 = native.read;
    delete() {
      native.remove(this.uri);
    }
  },
}));
const selected = (uri = 'file:///cache/picked.heic') => ({
  canceled: false,
  assets: [{ uri, width: 4032, height: 3024 }],
});
beforeEach(() => {
  vi.resetAllMocks();
  native.size = 4;
  native.library.mockResolvedValue(selected());
  native.camera.mockResolvedValue(selected());
  native.permission.mockResolvedValue({ granted: true, canAskAgain: true });
  native.manipulate.mockReturnValue({ renderAsync: native.render, release: native.releaseContext });
  native.render.mockResolvedValue({ saveAsync: native.save, release: native.releaseImage });
  native.save.mockResolvedValue({ uri: 'file:///cache/output.jpg', width: 2560, height: 1920 });
  native.read.mockResolvedValue('/9j/2Q==');
});

it('앨범 입력은 권한 팝업 없이 JPEG 정책으로 처리하고 캐시를 정리한 결과만 반환한다', async () => {
  expect(await photoActions.pickAttendancePhoto({ source: 'library' })).toEqual({
    status: 'SUCCESS',
    photo: {
      filename: 'team-attendance.jpg',
      contentType: 'image/jpeg',
      sizeBytes: 4,
      width: 2560,
      height: 1920,
      base64: '/9j/2Q==',
    },
  });
  expect(native.permission).not.toHaveBeenCalled();
  expect(native.request).not.toHaveBeenCalled();
  expect(native.library).toHaveBeenCalledWith(
    expect.objectContaining({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
      exif: false,
      base64: false,
      preferredAssetRepresentationMode: 'current',
    }),
  );
  expect(native.manipulate).toHaveBeenCalledWith('file:///cache/picked.heic', {
    maxWidth: 2560,
    maxHeight: 2560,
  });
  expect(native.save).toHaveBeenCalledWith({ format: 'jpeg', compress: 0.9 });
  expect(native.remove.mock.calls).toEqual([
    ['file:///cache/picked.heic'],
    ['file:///cache/output.jpg'],
  ]);
  expect(native.releaseImage).toHaveBeenCalledOnce();
  expect(native.releaseContext).toHaveBeenCalledOnce();
});

it('카메라는 재요청 가능한 권한을 얻은 뒤에만 연다', async () => {
  native.permission.mockResolvedValue({ granted: false, canAskAgain: true });
  native.request.mockResolvedValue({ granted: true, canAskAgain: true });
  await photoActions.pickAttendancePhoto({ source: 'camera' });
  expect(native.request).toHaveBeenCalledOnce();
  expect(native.camera).toHaveBeenCalledOnce();
  expect(native.library).not.toHaveBeenCalled();
});

it('영구 거부 시 다시 묻거나 카메라를 열지 않는다', async () => {
  native.permission.mockResolvedValue({ granted: false, canAskAgain: false });
  expect(await photoActions.pickAttendancePhoto({ source: 'camera' })).toEqual({
    status: 'ERROR',
    code: 'PERMISSION_DENIED',
    canAskAgain: false,
  });
  expect(native.request).not.toHaveBeenCalled();
  expect(native.camera).not.toHaveBeenCalled();
});

it('선택 취소는 변환을 시작하지 않는다', async () => {
  native.library.mockResolvedValue({ canceled: true, assets: null });
  expect(await photoActions.pickAttendancePhoto({ source: 'library' })).toEqual({
    status: 'CANCELLED',
  });
  expect(native.manipulate).not.toHaveBeenCalled();
});

it('해독 실패에도 선택기 캐시를 지우고 경로를 노출하지 않는다', async () => {
  native.render.mockRejectedValue(new Error('private file path'));
  expect(await photoActions.pickAttendancePhoto({ source: 'library' })).toEqual({
    status: 'ERROR',
    code: 'INVALID_IMAGE',
  });
  expect(native.remove).toHaveBeenCalledWith('file:///cache/picked.heic');
  expect(native.releaseContext).toHaveBeenCalledOnce();
});

it('용량 초과는 Base64를 읽기 전에 거부하고 두 캐시를 정리한다', async () => {
  native.size = 10 * 1024 * 1024 + 1;
  expect(await photoActions.pickAttendancePhoto({ source: 'library' })).toEqual({
    status: 'ERROR',
    code: 'TOO_LARGE',
  });
  expect(native.read).not.toHaveBeenCalled();
  expect(native.remove).toHaveBeenCalledTimes(2);
});

it('JPEG 읽기 실패는 처리 오류로 반환하고 생성한 파일과 이미지 참조를 정리한다', async () => {
  native.read.mockRejectedValue(new Error('private file path'));
  expect(await photoActions.pickAttendancePhoto({ source: 'library' })).toEqual({
    status: 'ERROR',
    code: 'PROCESSING_FAILED',
  });
  expect(native.remove.mock.calls).toEqual([
    ['file:///cache/picked.heic'],
    ['file:///cache/output.jpg'],
  ]);
  expect(native.releaseImage).toHaveBeenCalledOnce();
  expect(native.releaseContext).toHaveBeenCalledOnce();
});

it.each(['ph://original', 'file:///photos/original.heic', 'file:///cache/../photos/original.heic'])(
  '앱 캐시 밖의 원본 %s는 삭제하지 않는다',
  async (uri) => {
    native.library.mockResolvedValue(selected(uri));
    await photoActions.pickAttendancePhoto({ source: 'library' });
    expect(native.remove.mock.calls).toEqual([['file:///cache/output.jpg']]);
  },
);

it('한 캐시 삭제가 실패해도 다른 파일을 정리하고 사진 준비 성공을 유지한다', async () => {
  native.remove.mockImplementationOnce(() => {
    throw new Error('delete failed');
  });
  expect(await photoActions.pickAttendancePhoto({ source: 'library' })).toMatchObject({
    status: 'SUCCESS',
    photo: { base64: '/9j/2Q==', sizeBytes: 4 },
  });
  expect(native.remove).toHaveBeenCalledWith('file:///cache/output.jpg');
  expect(native.releaseImage).toHaveBeenCalledOnce();
});

it('캐시 삭제 실패가 기존 용량 초과 오류를 덮어쓰지 않는다', async () => {
  native.size = 10 * 1024 * 1024 + 1;
  native.remove.mockImplementation(() => {
    throw new Error('delete failed');
  });
  expect(await photoActions.pickAttendancePhoto({ source: 'library' })).toEqual({
    status: 'ERROR',
    code: 'TOO_LARGE',
  });
  expect(native.remove).toHaveBeenCalledTimes(2);
});
