import { describe, expect, it } from 'vitest';
import { attendanceResultSchema, badgeSchema, priorReportSchema } from './attendance';

const fields = {
  checkedInAt: null,
  earlyLeaveAt: null,
  reason: null,
  explicitlyOverridden: false,
};
const report = {
  id: 'report-1',
  membershipId: 'member-1',
  type: 'late',
  reason: '일정 지연',
  submittedAt: '2026-10-29T13:00:00+09:00',
  eligibility: 'eligible',
};

describe('독립 출결 모델', () => {
  it('출석에 남은 감점 구분과 결석의 시간 구간을 거부한다', () => {
    expect(
      attendanceResultSchema.safeParse({
        ...fields,
        status: 'present',
        penaltyCategory: 'unauthorized',
        durationBand: null,
      }).success,
    ).toBe(false);
    expect(
      attendanceResultSchema.safeParse({
        ...fields,
        status: 'absent',
        penaltyCategory: 'regular',
        durationBand: 'withinOneHour',
      }).success,
    ).toBe(false);
  });
  it('공결을 일반 결석으로 변환하지 않는다', () => {
    expect(
      attendanceResultSchema.safeParse({
        ...fields,
        status: 'EXCUSED_ABSENCE',
        penaltyCategory: 'regular',
        durationBand: null,
      }).success,
    ).toBe(false);
  });
  it('지각 보고와 명찰 확인은 실제 출결과 독립적이다', () => {
    const attendance = attendanceResultSchema.parse({
      ...fields,
      status: 'present',
      penaltyCategory: null,
      durationBand: null,
    });
    const member = {
      attendance,
      report: priorReportSchema.parse(report),
      badge: badgeSchema.parse({ verified: true, verifiedAt: null }),
    };
    expect(member.report.type).toBe('late');
    expect(attendance).toEqual({
      ...fields,
      status: 'present',
      penaltyCategory: null,
      durationBand: null,
    });
  });
  it('보고 유형은 지각·조퇴·결석만 허용하고 시각은 오프셋이 필요하다', () => {
    for (const type of ['late', 'earlyLeave', 'absence']) {
      expect(priorReportSchema.safeParse({ ...report, type }).success).toBe(true);
    }
    expect(priorReportSchema.safeParse({ ...report, type: 'present' }).success).toBe(false);
    expect(
      priorReportSchema.safeParse({ ...report, submittedAt: '2026-10-29T13:00:00' }).success,
    ).toBe(false);
  });
});
