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
