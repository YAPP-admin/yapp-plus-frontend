import { z } from 'zod';

/** OS의 위치 정밀 권한. 실제 측정 오차(accuracy)와는 별개다. */
const locationPrecisionSchema = z.enum([
  'precise', // 정확한 위치 접근 허용. 측정 오차를 보장하지 않는다.
  'approximate', // 대략적인 위치 접근만 허용.
  'unknown', // 권한이 없거나 정밀 수준을 알 수 없음.
]);

/** 팝업 없이 조회하는 앱 권한과 기기 위치 서비스 상태. */
export const locationPermissionSchema = z.object({
  status: z.enum(['granted', 'denied', 'undetermined']), // 허용·거부·미결정.
  canAskAgain: z.boolean(), // OS 권한 팝업을 다시 요청할 수 있는지 여부.
  precision: locationPrecisionSchema,
  servicesEnabled: z.boolean(), // 기기 전체 위치 서비스 활성 여부. 앱 권한과 별개다.
});

/** 단발 측정 결과. 출석 판정·오차 임계값·시간 경과 판단은 이 스키마의 책임이 아니다. */
export const locationSampleSchema = z.object({
  latitude: z.number().min(-90).max(90), // 위도(도).
  longitude: z.number().min(-180).max(180), // 경도(도).
  accuracy: z.number().nonnegative().nullable(), // 추정 수평 오차 반경(m). null은 미확인.
  timestamp: z.number().int().positive(), // 측정 시각(epoch ms), 양의 안전한 정수.
  precision: locationPrecisionSchema,
});

const locationErrorCodeSchema = z.enum([
  'PERMISSION_DENIED', // 위치 권한 미허용. 재요청 가능 여부를 함께 전달한다.
  'SERVICES_DISABLED', // 기기 위치 서비스가 꺼져 있음.
  'TIMEOUT', // 위치 측정 응답 대기 15초 초과.
  'BUSY', // 기존 위치 요청이나 권한 팝업이 진행 중.
  'APP_INACTIVE', // 시작·권한 확인 후·위치 반환 시 앱이 active가 아님.
  'LOCATION_UNAVAILABLE', // 위치 취득·응답 검증·브리지 통신·설정 실행 실패.
]);

/** ERROR는 요청 실패이며 출석 거절을 뜻하지 않는다. 원문 오류 필드는 제거한다. */
const locationFailureSchema = z.union([
  z.object({
    status: z.literal('ERROR'),
    code: z.literal('PERMISSION_DENIED'),
    canAskAgain: z.boolean(), // false이면 권한 변경을 위해 앱 설정 안내가 필요하다.
  }),
  z.object({
    status: z.literal('ERROR'),
    code: locationErrorCodeSchema.exclude(['PERMISSION_DENIED']),
  }),
]);

/** 조회 성공과 권한 허용은 별개다. SUCCESS의 permission.status가 denied일 수 있다. */
export const locationPermissionResultSchema = z.union([
  z.object({ status: z.literal('SUCCESS'), permission: locationPermissionSchema }),
  locationFailureSchema,
]);

/** SUCCESS는 위치 측정 성공이며 출석 완료가 아니다. */
export const locationResultSchema = z.union([
  z.object({ status: z.literal('SUCCESS'), location: locationSampleSchema }),
  locationFailureSchema,
]);

/** SUCCESS는 설정 실행 요청 성공이며 설정에서의 권한 변경을 보장하지 않는다. */
export const openAppSettingsResultSchema = z.union([
  z.object({ status: z.literal('SUCCESS') }),
  locationFailureSchema,
]);

// 공개 타입은 검증 스키마에서 추론해 실제 허용 값과 타입 선언이 어긋나지 않게 한다.
export type LocationPrecision = z.infer<typeof locationPrecisionSchema>;
export type LocationPermission = z.infer<typeof locationPermissionSchema>;
export type LocationSample = z.infer<typeof locationSampleSchema>;
export type LocationErrorCode = z.infer<typeof locationErrorCodeSchema>;
export type LocationFailure = z.infer<typeof locationFailureSchema>;
export type LocationPermissionResult = z.infer<typeof locationPermissionResultSchema>;
export type LocationResult = z.infer<typeof locationResultSchema>;
export type OpenAppSettingsResult = z.infer<typeof openAppSettingsResultSchema>;
