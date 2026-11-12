/** iOS 시스템 사진 입력을 JPEG로 변환한다. 앨범 원본 대신 이번 호출의 캐시만 정리한다. */
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat, type ImageRef } from 'expo-image-manipulator';
import { File, Paths } from 'expo-file-system';
import {
  ATTENDANCE_PHOTO_MAX_BYTES,
  ATTENDANCE_PHOTO_MAX_DIMENSION,
  ATTENDANCE_PHOTO_JPEG_QUALITY,
  type PickAttendancePhotoInput,
  type PickAttendancePhotoResult,
} from '@yapp-plus/app-bridge';
import { createPhotoActions } from './actions';

const pickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: false,
  allowsMultipleSelection: false,
  quality: 1,
  base64: false,
  exif: false,
  preferredAssetRepresentationMode:
    ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Current,
};

const removeTemporaryFile = (uri: string): void => {
  try {
    // 선택기가 반환한 복사본과 변환 결과 중 앱 캐시 내부만 삭제한다. 원본 URI는 건드리지 않는다.
    const normalized = new URL(uri).href;
    const cache = new URL(Paths.cache.uri).href.replace(/\/?$/, '/');
    if (normalized.startsWith(cache)) {
      const file = new File(normalized);
      if (file.exists) {
        file.delete();
      }
    }
  } catch {
    // 캐시 정리 실패가 사진 준비 결과를 덮어쓰거나 다른 파일의 정리를 막지 않게 한다.
    // 삭제하지 못한 파일은 앱 캐시에 남을 수 있다. 로컬 경로를 포함한 오류는 기록하지 않는다.
  }
};

const resolveCameraPermission = async () => {
  const permission = await ImagePicker.getCameraPermissionsAsync();
  return !permission.granted && permission.canAskAgain
    ? ImagePicker.requestCameraPermissionsAsync()
    : permission;
};

const renderPhoto = async (uri: string): Promise<ImageRef> => {
  // 디코딩 단계부터 긴 변을 제한한다. 비율·방향은 Expo가 유지하며 작은 이미지는 확대하지 않는다.
  const context = ImageManipulator.manipulate(uri, {
    maxWidth: ATTENDANCE_PHOTO_MAX_DIMENSION,
    maxHeight: ATTENDANCE_PHOTO_MAX_DIMENSION,
  });
  try {
    return await context.renderAsync();
  } finally {
    context.release();
  }
};

const convertPhoto = async (
  uri: string,
  temporaryUris: Set<string>,
): Promise<PickAttendancePhotoResult> => {
  // 해독 단계의 실패만 INVALID_IMAGE로 분류하고, 저장·읽기 예외는 액션 경계에서 정규화한다.
  const image = await renderPhoto(uri).catch(() => null);
  if (!image) {
    return { status: 'ERROR', code: 'INVALID_IMAGE' };
  }
  try {
    const saved = await image.saveAsync({
      format: SaveFormat.JPEG,
      compress: ATTENDANCE_PHOTO_JPEG_QUALITY,
    });
    temporaryUris.add(saved.uri);
    const file = new File(saved.uri);
    const sizeBytes = file.size;
    if (sizeBytes > ATTENDANCE_PHOTO_MAX_BYTES) {
      return { status: 'ERROR', code: 'TOO_LARGE' };
    }
    if (sizeBytes <= 0) {
      return { status: 'ERROR', code: 'INVALID_IMAGE' };
    }
    // 용량을 먼저 확인해 10MiB를 넘는 파일을 Base64로 복제하지 않는다.
    return {
      status: 'SUCCESS',
      photo: {
        filename: 'team-attendance.jpg',
        contentType: 'image/jpeg',
        sizeBytes,
        width: saved.width,
        height: saved.height,
        base64: await file.base64(),
      },
    };
  } finally {
    image.release();
  }
};

const prepare = async (
  source: PickAttendancePhotoInput['source'],
): Promise<PickAttendancePhotoResult> => {
  if (source === 'camera') {
    const permission = await resolveCameraPermission();
    if (!permission.granted) {
      return { status: 'ERROR', code: 'PERMISSION_DENIED', canAskAgain: permission.canAskAgain };
    }
  }
  // iOS 시스템 앨범 선택은 전체 사진 라이브러리 권한을 먼저 요청하지 않는다.
  const selection = await (source === 'camera'
    ? ImagePicker.launchCameraAsync(pickerOptions)
    : ImagePicker.launchImageLibraryAsync(pickerOptions));
  if (selection.canceled) {
    return { status: 'CANCELLED' };
  }
  const temporaryUris = new Set(selection.assets.map((asset) => asset.uri));
  try {
    const asset = selection.assets[0];
    if (!asset || selection.assets.length !== 1) {
      return { status: 'ERROR', code: 'INVALID_IMAGE' };
    }
    return await convertPhoto(asset.uri, temporaryUris);
  } finally {
    temporaryUris.forEach(removeTemporaryFile);
  }
};

/** picker·권한 팝업·변환 작업의 단일 잠금을 공유하는 앱 수명 액션이다. */
export const photoActions = createPhotoActions({ prepare });
