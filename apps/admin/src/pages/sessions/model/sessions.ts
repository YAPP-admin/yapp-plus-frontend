import { createSessionInputSchema, sessionSchema, type CreateSessionInput } from './session';

async function getStore() {
  if (import.meta.env.SSR || typeof window === 'undefined') {
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
