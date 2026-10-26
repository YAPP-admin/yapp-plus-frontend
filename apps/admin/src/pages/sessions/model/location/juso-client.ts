/** 행안부 전용 HTTP 설정입니다. 백엔드 인증 설정과 분리하고 승인키는 요청마다 전달합니다. */
import ky from 'ky';

// 백엔드의 인증 헤더·훅을 상속하지 않는 행안부 전용 인스턴스입니다.
export const jusoClient = ky.create({
  baseUrl: 'https://business.juso.go.kr/addrlink/',
  timeout: 10_000,
  totalTimeout: 10_000,
  retry: 0,
  credentials: 'omit',
  referrerPolicy: 'strict-origin-when-cross-origin',
});
