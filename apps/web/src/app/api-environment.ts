/** 회원 웹의 배포 환경 API 주소를 검증하고 생성 API client에 적용하는 앱 초기화 경계입니다. */

type ApiClient = {
  setConfig: (config: { baseUrl: string }) => unknown;
};

/**
 * 배포·로컬 실행이 제공한 API 기준 주소를 요청 전에 사용할 안전한 HTTPS 주소로 정규화합니다.
 *
 * 이 값은 앱의 API 요청 목적지를 결정하므로 누락·비 HTTPS·사용자 정보 포함 입력을 운영 기본값으로
 * 대체하지 않고 즉시 실패시킵니다.
 */
export function getWebApiBaseUrl(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error('VITE_API_BASE_URL을 설정해야 합니다.');
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('VITE_API_BASE_URL은 올바른 HTTPS URL이어야 합니다.');
  }

  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('VITE_API_BASE_URL은 사용자 정보가 없는 HTTPS URL이어야 합니다.');
  }

  return url.toString().replace(/\/$/, '');
}

/**
 * 검증된 API 기준 주소를 생성 client에 한 번 적용합니다.
 *
 * 호출자는 QueryClient 또는 화면을 만들기 전에 실행해야 모든 생성 요청이 같은 배포 환경을 사용합니다.
 */
export function configureWebApiClient(client: ApiClient, value: unknown): string {
  const baseUrl = getWebApiBaseUrl(value);
  client.setConfig({ baseUrl });
  return baseUrl;
}
