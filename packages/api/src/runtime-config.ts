import type { CreateClientConfig } from './generated/client.gen';

/** Ky가 본문을 선소비하지 않게 하고, 오류 파싱·throwOnError는 생성 SDK가 처리한다. */
export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  kyOptions: { ...config?.kyOptions, throwHttpErrors: false },
});
