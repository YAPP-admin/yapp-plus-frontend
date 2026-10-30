import {
  attendanceEditInputSchema,
  badgeEditInputSchema,
  teamDecisionInputSchema,
  type AttendanceEditInput,
  type BadgeEditInput,
  type TeamDecisionInput,
} from '../model/attendance-input';
import { createSessionInputSchema, sessionSchema, type CreateSessionInput } from '../model/session';

async function getStore() {
  if (import.meta.env.SSR || typeof window === 'undefined') {
    throw new Error('세션 관리 기능을 준비 중입니다.');
  }

  const { getBrowserSessionStore } = await import('../model/sessions.mock');
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

/** 생성과 같은 입력 계약으로 브라우저 예시 세션을 수정합니다. */
export async function updateSession(id: string, input: CreateSessionInput) {
  const store = await getStore();
  return sessionSchema.parse(store.updateSession(id, createSessionInputSchema.parse(input)));
}

export async function deleteSession(id: string) {
  const store = await getStore();
  store.deleteSession(id);
}

export async function getSessionAttendance(id: string) {
  const store = await getStore();
  return store.getSessionAttendance(id);
}

export async function getTeamReviews(sessionId: string) {
  const store = await getStore();
  return store.getTeamReviews(sessionId);
}

export async function updateTeamPhotoReview(sessionId: string, input: TeamDecisionInput) {
  const store = await getStore();
  return store.updateTeamPhotoReview(sessionId, teamDecisionInputSchema.parse(input));
}

export async function closeAttendance(sessionId: string) {
  const store = await getStore();
  return store.closeAttendance(sessionId);
}

export async function cancelAttendance(sessionId: string) {
  const store = await getStore();
  return store.cancelAttendance(sessionId);
}

export async function updateMemberAttendance(sessionId: string, input: AttendanceEditInput) {
  const store = await getStore();
  return store.updateMemberAttendance(sessionId, attendanceEditInputSchema.parse(input));
}

export async function updateMemberBadge(sessionId: string, input: BadgeEditInput) {
  const store = await getStore();
  return store.updateMemberBadge(sessionId, badgeEditInputSchema.parse(input));
}

export async function getAttendanceHistory(sessionId: string, membershipId: string) {
  const store = await getStore();
  return store.getAttendanceHistory(sessionId, membershipId);
}
