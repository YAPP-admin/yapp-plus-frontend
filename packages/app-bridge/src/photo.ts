/** native와 웹 사이의 사진 전송 계약이다. 이미지 디코딩·변환은 native가 담당한다. */
import { z } from 'zod';

/** 최종 JPEG 바이트의 상한. 원본 파일 크기가 아닌 변환 결과에 적용한다. */
export const ATTENDANCE_PHOTO_MAX_BYTES = 10 * 1024 * 1024;
/** 가로·세로 모두 이 값 이하이며 작은 원본은 확대하지 않는다. */
export const ATTENDANCE_PHOTO_MAX_DIMENSION = 2560;
/** native JPEG 저장 시 사용하는 압축 품질이다. */
export const ATTENDANCE_PHOTO_JPEG_QUALITY = 0.9;
const MAX_BASE64_LENGTH = Math.ceil(ATTENDANCE_PHOTO_MAX_BYTES / 3) * 4;

/** 사용자 동작으로 선택한 입력 경로. 임의의 URI나 파일 경로를 받지 않는다. */
export const pickAttendancePhotoInputSchema = z.object({ source: z.enum(['library', 'camera']) });

// Zod가 전체 문자열을 디코딩하기 전에 길이를 제한한다. 마지막 블록만 재인코딩해
// 내장 검증이 허용하는 비표준 패딩 비트도 거부한다.
const photoBase64Schema = z
  .string()
  .min(1)
  .max(MAX_BASE64_LENGTH)
  .pipe(z.base64())
  .pipe(z.string().refine((value) => btoa(atob(value.slice(-4))) === value.slice(-4)));

/**
 * 변환된 사진의 전송 형식과 크기를 검증한다. URI·EXIF 등 추가 필드는 제거한다.
 * Base64의 구문·바이트 길이를 검사하며 실제 이미지 해독 가능성을 보장하지는 않는다.
 */
export const attendancePhotoSchema = z
  .object({
    filename: z.literal('team-attendance.jpg'),
    contentType: z.literal('image/jpeg'),
    sizeBytes: z.number().int().positive().max(ATTENDANCE_PHOTO_MAX_BYTES),
    width: z.number().int().positive().max(ATTENDANCE_PHOTO_MAX_DIMENSION),
    height: z.number().int().positive().max(ATTENDANCE_PHOTO_MAX_DIMENSION),
    base64: photoBase64Schema,
  })
  .refine(
    ({ base64, sizeBytes }) => {
      // Base64는 바이너리 3바이트를 문자 4개로 표현한다. 마지막 묶음이 부족하면
      // '='(원본 2바이트) 또는 '=='(원본 1바이트)로 채우므로 패딩 수를 빼면
      // 실제 바이트 수가 된다. 전체 사진을 다시 디코딩하지 않고 선언된 sizeBytes와
      // 일치하는지 확인해 잘못된 크기 정보가 업로드 요청으로 전달되는 것을 막는다.
      // 이는 전송 인코딩·크기 검사이며 JPEG 헤더나 이미지 손상 여부를 검사하지 않는다.
      const padding = base64.endsWith('==') ? 2 : Number(base64.endsWith('='));
      return (base64.length / 4) * 3 - padding === sizeBytes;
    },
    {
      path: ['base64'],
      message: 'Base64 인코딩과 사진 바이트 길이가 일치해야 합니다.',
    },
  );

const photoFailureSchema = z.union([
  z.object({
    status: z.literal('ERROR'),
    code: z.literal('PERMISSION_DENIED'),
    canAskAgain: z.boolean(),
  }),
  z.object({
    status: z.literal('ERROR'),
    code: z.enum(['INVALID_INPUT', 'BUSY', 'INVALID_IMAGE', 'TOO_LARGE', 'PROCESSING_FAILED']),
  }),
]);

/** 취소는 기존 사진 유지, 성공은 사진 준비 완료다. 출석 제출 성공을 뜻하지 않는다. */
export const pickAttendancePhotoResultSchema = z.union([
  z.object({ status: z.literal('SUCCESS'), photo: attendancePhotoSchema }),
  z.object({ status: z.literal('CANCELLED') }),
  photoFailureSchema,
]);

/** 사진 RPC의 입력. 외부 메시지는 사용 전에 대응 스키마로 검증한다. */
export type PickAttendancePhotoInput = z.infer<typeof pickAttendancePhotoInputSchema>;
/** 화면이 소유하는 일시적 전송 데이터. 영구 저장소·로그·쿼리 캐시에 보관하지 않는다. */
export type AttendancePhoto = z.infer<typeof attendancePhotoSchema>;
/** 정규화된 사진 처리 오류. 권한 거부에서만 재요청 가능 여부를 제공한다. */
export type AttendancePhotoFailure = z.infer<typeof photoFailureSchema>;
/** 호출자는 화면 이탈 이후 도착한 결과를 버리고 취소 시 기존 사진을 유지한다. */
export type PickAttendancePhotoResult = z.infer<typeof pickAttendancePhotoResultSchema>;
