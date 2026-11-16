import { client } from './generated/client.gen';

/** HTTP 실패만 표현한다. 본문은 사용처에서 검증하고 요청·헤더·URL은 보관하지 않는다. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API 요청 실패 (HTTP ${status})`);
    this.name = 'ApiError';
  }
}

let initialized = false;

/** 앱 시작 시 기본 생성 client의 오류 계약을 등록한다. 반복 호출해도 중복 등록하지 않는다. */
export function initializeApiErrorHandling(): void {
  if (initialized) {
    return;
  }
  client.interceptors.error.use((body, response) =>
    response && !response.ok ? new ApiError(response.status, body) : body,
  );
  initialized = true;
}
