/** 빌드 설정과 런타임에서 같은 WebView URL 경계를 적용합니다. */
export function validateMobileWebUrl(value: unknown, development: boolean): string | undefined {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) {
    if (development) {
      return undefined;
    }
    throw new Error('배포 빌드에는 MOBILE_WEB_URL이 필요합니다.');
  }
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    throw new Error('MOBILE_WEB_URL은 유효한 절대 URL이어야 합니다.');
  }
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  const loopback =
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host === '[::1]' ||
    host === '[::]' ||
    /^\[::ffff:7f[0-9a-f]{2}:/.test(host) ||
    host === '0.0.0.0' ||
    host.startsWith('127.') ||
    host === '10.0.2.2';
  if (
    url.username ||
    url.password ||
    (url.protocol !== 'https:' && !(development && url.protocol === 'http:')) ||
    (!development && loopback)
  ) {
    throw new Error(
      'MOBILE_WEB_URL은 인증 정보가 없는 공개 HTTPS 주소여야 합니다. 개발 환경만 로컬 HTTP를 허용합니다.',
    );
  }
  return url.href;
}
