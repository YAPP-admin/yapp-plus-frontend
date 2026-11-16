/** native가 준비하고 브리지에서 검증한 JPEG 바이트를 Blob으로 옮긴다. 이미지 변환은 하지 않는다. */
import type { AttendancePhoto } from '@yapp-plus/app-bridge';

/** 제출용 바이트와 크기만 보관한다. URL·Base64·원본 파일은 초안에 남기지 않는다. */
export type PreparedPhoto = { blob: Blob; width: number; height: number };

/** 검증된 JPEG의 Base64 인코딩만 풀어 Blob으로 옮긴다. 이미지 해독·리사이즈·재압축은 하지 않는다. */
export function fromNativePhoto(photo: AttendancePhoto): PreparedPhoto {
  const bytes = Uint8Array.from(atob(photo.base64), (char) => char.charCodeAt(0));
  return {
    blob: new Blob([bytes], { type: photo.contentType }),
    width: photo.width,
    height: photo.height,
  };
}
