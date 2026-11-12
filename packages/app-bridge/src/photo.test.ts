/** 사진 RPC의 제품 제한값·추가 검증·정보 노출 정책만 검증한다. */
import { describe, expect, it } from 'vitest';

import { attendancePhotoSchema, pickAttendancePhotoResultSchema } from './photo';

const photo = {
  filename: 'team-attendance.jpg',
  contentType: 'image/jpeg',
  sizeBytes: 4,
  width: 2560,
  height: 2560,
  base64: '/9j/2Q==',
};

describe('사진 바이트 계약', () => {
  it.each([1, 2, 3])('패딩에 따른 실제 %i바이트 길이를 계산한다', (sizeBytes) => {
    // 이미지 디코딩은 native 책임이며 여기서는 전송 인코딩과 길이만 검사한다.
    const base64 = btoa('\0'.repeat(sizeBytes));
    expect(attendancePhotoSchema.safeParse({ ...photo, sizeBytes, base64 }).success).toBe(true);
  });

  it.each([
    { sizeBytes: 0, accepted: false },
    { sizeBytes: 10 * 1024 * 1024, accepted: true },
    { sizeBytes: 10 * 1024 * 1024 + 1, accepted: false },
  ])('제품 용량 경계: $sizeBytes바이트 → $accepted', ({ sizeBytes, accepted }) => {
    expect(
      attendancePhotoSchema.safeParse({
        ...photo,
        sizeBytes,
        base64: btoa('\0'.repeat(sizeBytes)),
      }).success,
    ).toBe(accepted);
  });

  it('신고한 크기와 실제 바이트 길이가 다르면 거부한다', () => {
    expect(attendancePhotoSchema.safeParse({ ...photo, sizeBytes: 3 }).success).toBe(false);
  });

  it.each([
    { sizeBytes: 4, base64: '/9j/2R==' },
    { sizeBytes: 2, base64: 'AAF=' },
  ])('내장 Base64 검사가 허용하는 비표준 패딩 비트 %j를 거부한다', (override) => {
    expect(attendancePhotoSchema.safeParse({ ...photo, ...override }).success).toBe(false);
  });

  it.each([{ width: 2561 }, { height: 2561 }])('긴 변 2,560px 초과 %j를 거부한다', (override) => {
    expect(attendancePhotoSchema.safeParse({ ...photo, ...override }).success).toBe(false);
  });
});

describe('사진 결과 계약', () => {
  it('성공 응답에서 로컬 URI와 EXIF를 웹에 전달하지 않는다', () => {
    expect(
      pickAttendancePhotoResultSchema.parse({
        status: 'SUCCESS',
        photo: { ...photo, uri: 'file:///private', exif: { GPS: 1 } },
      }),
    ).toEqual({ status: 'SUCCESS', photo });
  });

  it('권한 거부에는 설정 안내에 필요한 재요청 가능 여부를 요구한다', () => {
    const result = { status: 'ERROR', code: 'PERMISSION_DENIED' };
    expect(pickAttendancePhotoResultSchema.safeParse(result).success).toBe(false);
    expect(pickAttendancePhotoResultSchema.parse({ ...result, canAskAgain: false })).toEqual({
      ...result,
      canAskAgain: false,
    });
  });

  it('원문 오류와 권한 오류 이외의 canAskAgain을 제거한다', () => {
    expect(
      pickAttendancePhotoResultSchema.parse({
        status: 'ERROR',
        code: 'PROCESSING_FAILED',
        message: 'private path',
        canAskAgain: true,
      }),
    ).toEqual({ status: 'ERROR', code: 'PROCESSING_FAILED' });
  });
});
