/** 홈의 서버 주소·좌표를 검증해 브라우저·WebView가 함께 사용할 지도 링크를 만든다. */
import { locationSampleSchema } from '@yapp-plus/app-bridge';
import type { CurrentWeekSessionDetailResponse } from '@yapp-plus/api/generated';

const COORDINATES = locationSampleSchema.pick({ latitude: true, longitude: true });

/** 도로명 주소와 유효 좌표가 모두 있어야 검색 링크를 만든다. 좌표는 검색 중심이다. */
export function getSessionMapUrl(
  location: Pick<CurrentWeekSessionDetailResponse, 'roadAddress' | 'latitude' | 'longitude'>,
): string | null {
  const address = location.roadAddress?.trim();
  const parsed = COORDINATES.safeParse(location);
  if (!address || !parsed.success) {
    return null;
  }
  return `https://m.map.kakao.com/scheme/search?q=${encodeURIComponent(address)}&p=${parsed.data.latitude},${parsed.data.longitude}`;
}
