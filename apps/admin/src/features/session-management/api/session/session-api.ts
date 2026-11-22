import {
  create2,
  delete1,
  find1,
  type CreateSessionRequest,
  type CreateSessionResponse,
  type SessionListResponse,
  update1,
} from '@yapp-plus/api/generated';

/** 기수 세션 전체 목록을 조회한다. 유형 필터는 화면의 클라이언트 필터링을 위해 ALL로 고정한다. */
export async function listSessions(
  generationId: number,
  signal?: AbortSignal,
): Promise<SessionListResponse> {
  const { data } = await find1({
    path: { generationId },
    query: { type: 'ALL' },
    signal,
    throwOnError: true,
  });

  return data;
}

/** 기수에 세션을 등록한다. 요청 본문은 생성 SDK의 계약을 그대로 사용한다. */
export async function createSession(
  generationId: number,
  body: CreateSessionRequest,
): Promise<CreateSessionResponse> {
  const { data } = await create2({
    path: { generationId },
    body,
    throwOnError: true,
  });

  return data;
}

/** 기수 세션 정보를 전체 교체한다. 성공 응답은 본문 없는 204다. */
export async function updateSession(
  generationId: number,
  sessionId: number,
  body: CreateSessionRequest,
): Promise<void> {
  await update1({
    path: { generationId, sessionId },
    body,
    throwOnError: true,
  });
}

/** 출석이 시작되지 않은 기수 세션을 삭제한다. 성공 응답은 본문 없는 204다. */
export async function deleteSession(generationId: number, sessionId: number): Promise<void> {
  await delete1({
    path: { generationId, sessionId },
    throwOnError: true,
  });
}
