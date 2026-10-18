/** 개발용 브라우저 저장소에 접근하고 세션 입출력을 검증하는 비동기 서비스입니다. */
import {
  createSessionInputSchema,
  sessionSchema,
  updateSessionInputSchema,
  type UpdateSessionInput,
  type CreateSessionInput,
} from './session';

async function getStore() {
  if (!import.meta.env.DEV || import.meta.env.SSR || typeof window === 'undefined') {
    throw new Error('세션 관리 기능을 준비 중입니다.');
  }

  const { getBrowserSessionStore } = await import('./sessions.mock');
  return getBrowserSessionStore();
}

export async function listSessions() {
  const store = await getStore();
  return sessionSchema.array().parse(store.listSessions());
}

export async function createSession(input: CreateSessionInput) {
  const store = await getStore();
  return sessionSchema.parse(store.createSession(createSessionInputSchema.parse(input)));
}

export async function deleteSession(id: string) {
  const store = await getStore();
  store.deleteSession(id);
}

export async function updateSession(input: UpdateSessionInput) {
  const store = await getStore();
  return sessionSchema.parse(store.updateSession(updateSessionInputSchema.parse(input)));
}
