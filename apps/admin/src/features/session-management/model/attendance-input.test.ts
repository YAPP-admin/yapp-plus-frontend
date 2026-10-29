import { describe, expect, it } from 'vitest';
import {
  attendanceDraftSchema,
  attendanceEditInputSchema,
  badgeEditInputSchema,
  closeAttendanceInputSchema,
  teamDecisionInputSchema,
} from './attendance-input';

const present = {
  membershipId: 'member-1',
  status: 'present',
  penaltyCategory: null,
  durationBand: null,
};
const emptyDraft = { sessionId: 'session-1', memberEdits: {}, badgeEdits: {}, teamDecisions: {} };

describe('운영진 출결 입력', () => {
  it.each(['present', 'undecided'])('%s 입력에 이전 감점 설정이 남으면 거부한다', (status) => {
    expect(attendanceEditInputSchema.safeParse({ ...present, status }).success).toBe(true);
    expect(
      attendanceEditInputSchema.safeParse({ ...present, status, penaltyCategory: 'regular' })
        .success,
    ).toBe(false);
    expect(
      attendanceEditInputSchema.safeParse({ ...present, status, durationBand: 'withinOneHour' })
        .success,
    ).toBe(false);
  });
  it.each(['late', 'earlyLeave'])('%s 입력은 시간 구간과 일반/무단 구분이 필요하다', (status) => {
    const input = {
      ...present,
      status,
      penaltyCategory: 'regular',
      durationBand: 'withinThreeHours',
    };
    expect(attendanceEditInputSchema.safeParse(input).success).toBe(true);
    expect(
      attendanceEditInputSchema.safeParse({ ...input, penaltyCategory: 'unknown' }).success,
    ).toBe(false);
    expect(attendanceEditInputSchema.safeParse({ ...input, durationBand: null }).success).toBe(
      false,
    );
  });
  it('결석은 시간 구간 없이 일반/무단을 지정하고 미지원 출결은 입력하지 못한다', () => {
    expect(
      attendanceEditInputSchema.safeParse({
        ...present,
        status: 'absent',
        penaltyCategory: 'unauthorized',
      }).success,
    ).toBe(true);
    expect(attendanceEditInputSchema.safeParse({ ...present, status: 'unsupported' }).success).toBe(
      false,
    );
  });
  it('선택적 사유를 정리하고 명찰 변경에는 출결을 포함하지 않는다', () => {
    expect(attendanceEditInputSchema.parse(present).reason).toBeNull();
    expect(attendanceEditInputSchema.parse({ ...present, reason: ' 확인 완료 ' }).reason).toBe(
      '확인 완료',
    );
    expect(
      badgeEditInputSchema.parse({ membershipId: 'member-1', verified: true, status: 'absent' }),
    ).toEqual({ membershipId: 'member-1', verified: true });
  });
});

describe('검수와 마감 초안', () => {
  it('팀 판단은 승인/반려와 최대 500자 선택 사유를 받는다', () => {
    for (const decision of ['approve', 'reject']) {
      expect(teamDecisionInputSchema.parse({ photoId: 'photo-1', decision }).reason).toBeNull();
      expect(
        teamDecisionInputSchema.safeParse({
          photoId: 'photo-1',
          decision,
          reason: '가'.repeat(500),
        }).success,
      ).toBe(true);
      expect(
        teamDecisionInputSchema.safeParse({
          photoId: 'photo-1',
          decision,
          reason: '가'.repeat(501),
        }).success,
      ).toBe(false);
    }
    expect(
      teamDecisionInputSchema.safeParse({ photoId: 'photo-1', decision: 'pending' }).success,
    ).toBe(false);
  });
  it('같은 회원의 출결·명찰과 팀 판단을 별도 초안으로 유지한다', () => {
    const draft = attendanceDraftSchema.parse({
      ...emptyDraft,
      memberEdits: { 'member-1': present },
      badgeEdits: { 'member-1': { membershipId: 'member-1', verified: true } },
      teamDecisions: { 'photo-1': { photoId: 'photo-1', decision: 'reject' } },
    });
    expect(draft.memberEdits['member-1']?.status).toBe('present');
    expect(draft.badgeEdits['member-1']?.verified).toBe(true);
    expect(draft.teamDecisions['photo-1']?.decision).toBe('reject');
    expect(closeAttendanceInputSchema.safeParse({ sessionId: 'session-1', draft }).success).toBe(
      true,
    );
  });
  it.each([
    { memberEdits: { wrong: present } },
    { badgeEdits: { wrong: { membershipId: 'member-1', verified: false } } },
    { teamDecisions: { wrong: { photoId: 'photo-1', decision: 'approve' } } },
  ])('대상 ID와 다른 키로 기록된 초안을 거부한다: %j', (edits) => {
    expect(attendanceDraftSchema.safeParse({ ...emptyDraft, ...edits }).success).toBe(false);
  });
  it('다른 세션 초안을 마감하지 못하고 조회 필터를 마감 범위로 전달하지 않는다', () => {
    expect(
      closeAttendanceInputSchema.safeParse({ sessionId: 'session-2', draft: emptyDraft }).success,
    ).toBe(false);
    const input = closeAttendanceInputSchema.parse({
      sessionId: 'session-1',
      draft: emptyDraft,
      part: 'web',
    });
    expect(input).not.toHaveProperty('part');
    expect(input.draft).toEqual(emptyDraft);
  });
});
