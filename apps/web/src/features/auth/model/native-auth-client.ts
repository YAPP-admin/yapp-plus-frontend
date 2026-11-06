import type { CreateClientConfig } from '@yapp-plus/api/generated';
import type { QueryClient } from '@tanstack/react-query';
import { nativeSessionQueryKey, readAuthSession } from './operations';
import type { AuthSession } from '@yapp-plus/app-bridge';
import ky from 'ky';
import { refreshNativeSession } from './native-auth';

/** Provider가 제공하는 SDK 옵션입니다. 401 복구는 HTTP 응답 훅에서 한 번만 수행합니다. */
export const nativeAuthClientOptions = (session?: AuthSession, client?: QueryClient) =>
  ({
    auth: session?.accessToken,
    retry: session ? { limit: 1, shouldRetry: () => false } : 0,
    kyOptions: {
      // 오류 본문은 생성 SDK가 한 번만 읽고 throwOnError 정책에 따라 전달합니다.
      throwHttpErrors: false,
      hooks: {
        afterResponse: [
          async ({ request, response, retryCount }) => {
            if (!session || response.status !== 401 || request.method !== 'GET' || retryCount > 0) {
              return response;
            }
            request.signal.throwIfAborted();
            const refresh = async () => {
              const result = await refreshNativeSession({
                sessionId: session.sessionId,
                tokenVersion: session.tokenVersion,
              });
              // 다른 계정의 응답은 현재 요청의 인증 상태로 적용하지 않습니다.
              if (
                result?.status === 'SIGNED_IN' &&
                (result.session.userId !== session.userId ||
                  result.session.sessionId !== session.sessionId)
              ) {
                return { status: 'CANCELLED' as const };
              }
              return result;
            };
            const result = client
              ? await readAuthSession(client, request.signal, refresh)
              : await refresh();
            if (client && (result?.status === 'SIGNED_IN' || result?.status === 'SIGNED_OUT')) {
              client.setQueryData(nativeSessionQueryKey, result);
            }
            request.signal.throwIfAborted();
            if (
              result?.status !== 'SIGNED_IN' ||
              result.session.userId !== session.userId ||
              result.session.sessionId !== session.sessionId ||
              result.session.tokenVersion < session.tokenVersion
            ) {
              return response;
            }
            const headers = new Headers(request.headers);
            headers.set('Authorization', `Bearer ${result.session.accessToken}`);
            return ky.retry({ request: new Request(request, { headers }), delay: 0 });
          },
        ],
      },
    },
  }) satisfies ReturnType<CreateClientConfig>;
