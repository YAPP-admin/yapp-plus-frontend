/** 주소 검색의 환경 변수 접근과 설정 누락 처리를 화면에서 분리합니다. */
import { z } from 'zod';

const approvalKeySchema = z.string().trim().min(1);

/** 승인키가 설정되지 않았으면 검색 비활성화를 위해 null을 반환합니다. */
export function getAddressSearchKey(): string | null {
  const result = approvalKeySchema.safeParse(import.meta.env.VITE_JUSO_SEARCH_KEY);
  return result.success ? result.data : null;
}

/** 좌표 승인키는 요청 경계에서만 읽습니다. */
export function getCoordinatesKey(): string | null {
  const result = approvalKeySchema.safeParse(import.meta.env.VITE_JUSO_COORD_KEY);
  return result.success ? result.data : null;
}

/** 지도 JavaScript 키가 없으면 로딩 대신 설정 안내를 제공합니다. */
export function getKakaoMapKey(): string | null {
  const result = approvalKeySchema.safeParse(import.meta.env.VITE_KAKAO_MAP_JS_KEY);
  return result.success ? result.data : null;
}
