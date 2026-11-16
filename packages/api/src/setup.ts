/** 앱 시작 시 import해 기본 생성 client에 공통 HTTP 오류 계약을 등록한다. */
import { client } from './generated/client.gen';
import { ApiError } from './http-error';

client.interceptors.error.use((body, response) =>
  response && !response.ok ? new ApiError(response.status, body) : body,
);
