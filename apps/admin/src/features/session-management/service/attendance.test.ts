import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { AttendanceEditInput } from '../model/attendance-input';

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('SSR', false);
});
afterEach(() => vi.unstubAllEnvs());

async function setup() {
  const service = await import('./index');
  const controls = await import('../testing');
  const session = await service.createSession({
    name: '출결 흐름 검증',
    type: 'team',
    location: { guide: '' },
    date: '2026-11-01',
    startTime: '14:00',
    endTime: '17:00',
  });
  const { members } = await service.getSessionAttendance(session.id);
  const [first, second] = members;
  if (!first || !second) {
    throw new Error('서로 다른 출결 수정 대상이 필요합니다.');
  }
  const edit: AttendanceEditInput = {
    membershipId: first.membershipId,
    status: 'earlyLeave',
    penaltyCategory: 'regular',
    durationBand: 'withinOneHour',
    reason: '운영진 확인',
  };
  return { service, controls, session, first, second, edit };
}

it('출결 수정은 보고·명찰을 보존하고 목록·상세·회원 이력을 갱신한다', async () => {
  const { service, session, first, edit } = await setup();
  const badge = await service.updateMemberBadge(session.id, {
    membershipId: first.membershipId,
    verified: true,
  });
  expect(badge.attendance).toEqual(first.attendance);
  expect(badge.score).toEqual(first.score);
  const changed = await service.updateMemberAttendance(session.id, edit);
  expect(changed.badge).toEqual(badge.badge);
  expect(changed.latestReport).toEqual(first.latestReport);
  expect(changed.attendance).toMatchObject({
    status: 'earlyLeave',
    explicitlyOverridden: true,
    checkedInAt: null,
    earlyLeaveAt: null,
  });
  const detail = await service.getSessionAttendance(session.id);
  expect(detail.session.summary).toMatchObject({
    earlyLeave: 1,
    late: 0,
    undecided: detail.members.length - 1,
  });
  expect(
    (await service.listSessions()).find(({ id }) => id === session.id)?.attendance,
  ).toMatchObject({ earlyLeave: 1, late: 0, pending: detail.members.length - 1 });
  const history = await service.getAttendanceHistory(session.id, first.membershipId);
  expect(history).toHaveLength(1);
  expect(history[0]).toMatchObject({
    before: first.attendance,
    after: changed.attendance,
    reason: edit.reason,
  });
  history.forEach((entry) => {
    entry.reason = '외부 변경';
  });
  changed.attendance.reason = '외부 변경';
  expect((await service.getAttendanceHistory(session.id, first.membershipId))[0]?.reason).toBe(
    edit.reason,
  );
  expect(
    (await service.getSessionAttendance(session.id)).members.find(
      (member) => member.membershipId === first.membershipId,
    )?.attendance.reason,
  ).toBe(edit.reason);
});

it('다른 회원 요청 실패 후 재시도해도 성공한 수정과 이력이 중복되지 않는다', async () => {
  const { service, controls, session, first, second, edit } = await setup();
  await service.updateMemberAttendance(session.id, edit);
  controls.failNextAttendanceOperation('attendance', session.id, second.membershipId);
  const secondEdit = { ...edit, membershipId: second.membershipId };
  await expect(service.updateMemberAttendance(session.id, secondEdit)).rejects.toThrow(
    '모의 요청에 실패했습니다.',
  );
  expect(await service.getAttendanceHistory(session.id, second.membershipId)).toEqual([]);
  expect(
    (await service.getSessionAttendance(session.id)).members.find(
      (member) => member.membershipId === second.membershipId,
    )?.attendance,
  ).toEqual(second.attendance);
  await service.updateMemberAttendance(session.id, edit);
  await service.updateMemberAttendance(session.id, secondEdit);
  expect(await service.getAttendanceHistory(session.id, first.membershipId)).toHaveLength(1);
  expect(await service.getAttendanceHistory(session.id, second.membershipId)).toHaveLength(1);
});

it('명찰 실패는 출결을 되돌리지 않고 재시도·확인 해제는 출결 이력을 추가하지 않는다', async () => {
  const { service, controls, session, first, edit } = await setup();
  const changed = await service.updateMemberAttendance(session.id, edit);
  const badge = { membershipId: first.membershipId, verified: true };
  controls.failNextAttendanceOperation('badge', session.id, first.membershipId);
  await expect(service.updateMemberBadge(session.id, badge)).rejects.toThrow(
    '모의 요청에 실패했습니다.',
  );
  const verified = await service.updateMemberBadge(session.id, badge);
  expect(verified.badge.verifiedAt).not.toBeNull();
  expect((await service.updateMemberBadge(session.id, badge)).badge).toEqual(verified.badge);
  const cleared = await service.updateMemberBadge(session.id, { ...badge, verified: false });
  expect(cleared.badge).toEqual({ verified: false, verifiedAt: null });
  expect(cleared.attendance).toEqual(changed.attendance);
  expect(cleared.score).toEqual(changed.score);
  expect(await service.getAttendanceHistory(session.id, first.membershipId)).toHaveLength(1);
});

it('잘못된 대상·입력은 출결과 이력을 변경하지 않는다', async () => {
  const { service, session, first, edit } = await setup();
  const before = await service.getSessionAttendance(session.id);
  await expect(
    service.updateMemberAttendance(session.id, { ...edit, membershipId: 'missing' }),
  ).rejects.toThrow('출결을 변경할 회원을 찾을 수 없습니다.');
  await expect(
    service.updateMemberAttendance(session.id, { ...edit, membershipId: '' }),
  ).rejects.toThrow('membershipId');
  await expect(
    service.updateMemberBadge('missing', { membershipId: first.membershipId, verified: true }),
  ).rejects.toThrow('출석을 조회할 세션을 찾을 수 없습니다.');
  expect(await service.getSessionAttendance(session.id)).toEqual(before);
  expect(await service.getAttendanceHistory(session.id, first.membershipId)).toEqual([]);
});

it('조회 실패를 재시도하고 세션 삭제 시 이력도 조회할 수 없다', async () => {
  const { service, controls, session, first, edit } = await setup();
  await service.updateMemberAttendance(session.id, edit);
  controls.failNextAttendanceOperation('read', session.id);
  await expect(service.getSessionAttendance(session.id)).rejects.toThrow(
    '모의 요청에 실패했습니다.',
  );
  expect((await service.getSessionAttendance(session.id)).session.id).toBe(session.id);
  controls.failNextAttendanceOperation('history', session.id, first.membershipId);
  await expect(service.getAttendanceHistory(session.id, first.membershipId)).rejects.toThrow(
    '모의 요청에 실패했습니다.',
  );
  expect(await service.getAttendanceHistory(session.id, first.membershipId)).toHaveLength(1);
  await service.deleteSession(session.id);
  await expect(service.getAttendanceHistory(session.id, first.membershipId)).rejects.toThrow(
    '출석을 조회할 세션을 찾을 수 없습니다.',
  );
});

it('서버에서는 수정과 이력 조회를 실행하지 않는다', async () => {
  const { service, session, first, edit } = await setup();
  vi.stubEnv('SSR', true);
  await expect(service.updateMemberAttendance(session.id, edit)).rejects.toThrow(
    '세션 관리 기능을 준비 중입니다.',
  );
  await expect(
    service.updateMemberBadge(session.id, { membershipId: first.membershipId, verified: true }),
  ).rejects.toThrow('세션 관리 기능을 준비 중입니다.');
  await expect(service.getAttendanceHistory(session.id, first.membershipId)).rejects.toThrow(
    '세션 관리 기능을 준비 중입니다.',
  );
});

it('사전 보고가 있는 회원의 실제 출결을 바꿔도 보고 내용은 유지한다', async () => {
  const service = await import('./index');
  const { session, members } = await service.getSessionAttendance('demo-offline-session');
  const reported = members.find((member) => member.latestReport !== null);
  if (!reported) {
    throw new Error('사전 보고가 있는 수정 대상이 필요합니다.');
  }
  const updated = await service.updateMemberAttendance(session.id, {
    membershipId: reported.membershipId,
    status: 'absent',
    penaltyCategory: 'regular',
    durationBand: null,
    reason: '실제 출결 확인',
  });
  expect(updated.latestReport).toEqual(reported.latestReport);
  expect(updated.attendance.status).toBe('absent');
  expect((await service.getSessionAttendance(session.id)).session.summary.reported).toBe(
    session.summary.reported,
  );
});

it('출석 마감은 전체 미정을 결석으로 바꾸고 마감 취소는 결과를 유지한 채 편집을 연다', async () => {
  const { service, session, first, edit } = await setup();
  await service.updateMemberAttendance(session.id, edit);
  const beforeClose = await service.getSessionAttendance(session.id);
  const closed = await service.closeAttendance(session.id);
  expect(closed.session.phase).toBe('closed');
  expect(closed.session.canCancelClose).toBe(true);
  expect(closed.session.summary.undecided).toBe(0);
  expect(closed.members.filter((member) => member.attendance.status === 'absent')).toHaveLength(
    beforeClose.members.length - 1,
  );
  expect(
    closed.members.find((member) => member.membershipId === first.membershipId)?.isEditable,
  ).toBe(false);
  await expect(service.updateMemberAttendance(session.id, edit)).rejects.toThrow('마감된 세션');
  const cancelled = await service.cancelAttendance(session.id);
  expect(cancelled.session.phase).toBe('open');
  expect(cancelled.session.canCancelClose).toBe(false);
  expect(
    cancelled.members.find((member) => member.membershipId === first.membershipId)?.attendance,
  ).toEqual(
    closed.members.find((member) => member.membershipId === first.membershipId)?.attendance,
  );
  expect(
    cancelled.members.find((member) => member.membershipId === first.membershipId)?.isEditable,
  ).toBe(true);
});
