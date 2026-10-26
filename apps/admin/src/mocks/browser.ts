import { client } from '@yapp-plus/api/generated';
import { createApiMockHandlers, onUnhandledApiRequest } from '@yapp-plus/api/mocks';
import { setupWorker } from 'msw/browser';

let startPromise: Promise<void> | undefined;

export function startMocking(): Promise<void> {
  // StrictMode와 여러 소비자가 같은 worker 시작을 기다리도록 한다.
  startPromise ??= (async () => {
    const baseUrl = client.getConfig().baseUrl;
    if (!baseUrl) {
      throw new Error('모킹할 API base URL이 없습니다.');
    }

    const worker = setupWorker(...createApiMockHandlers(baseUrl));
    await worker.start({
      serviceWorker: { url: '/mockServiceWorker.js' },
      onUnhandledRequest: onUnhandledApiRequest(baseUrl),
    });
  })();
  return startPromise;
}
