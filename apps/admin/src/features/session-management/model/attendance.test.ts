import { describe, expect, it } from 'vitest';
import { attendanceResultSchema, badgeSchema, priorReportSchema } from './attendance';
import { calculateAttendanceDelta } from './attendance-score';

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

function delta(status: string, penaltyCategory: string | null, durationBand: string | null) {
  return calculateAttendanceDelta(
    attendanceResultSchema.parse({ ...fields, status, penaltyCategory, durationBand }),
  );
}

describe('독립 출결 감점 규칙', () => {
  it.each(['late', 'earlyLeave'])('%s의 일반/무단·시간 구간별 감점', (status) => {
    expect(delta(status, 'regular', 'withinOneHour')).toBe(-4);
    expect(delta(status, 'regular', 'withinThreeHours')).toBe(-8);
    expect(delta(status, 'unauthorized', 'withinOneHour')).toBe(-10);
    expect(delta(status, 'unauthorized', 'withinThreeHours')).toBe(-14);
  });
  it('출석과 일반/무단 결석을 구분한다', () => {
    expect(delta('present', null, null)).toBe(0);
    expect(delta('absent', 'regular', null)).toBe(-12);
    expect(delta('absent', 'unauthorized', null)).toBe(-20);
  });
  it('미정·미지원·근거 누락을 0점으로 확정하지 않는다', () => {
    expect(delta('undecided', null, null)).toBeNull();
    expect(delta('unsupported', 'unknown', null)).toBeNull();
    expect(delta('absent', 'unknown', null)).toBeNull();
    expect(delta('late', 'regular', null)).toBeNull();
    expect(delta('earlyLeave', 'unknown', 'withinOneHour')).toBeNull();
  });
  it('출석에 남은 감점 구분과 결석의 시간 구간을 거부한다', () => {
    expect(() => delta('present', 'unauthorized', null)).toThrow('penaltyCategory');
    expect(() => delta('absent', 'regular', 'withinOneHour')).toThrow('durationBand');
  });
  it('공결을 일반 결석으로 변환하지 않는다', () => {
    expect(() => delta('EXCUSED_ABSENCE', 'regular', null)).toThrow('status');
  });
  it('지각 보고와 명찰 확인은 실제 출석 및 감점과 독립적이다', () => {
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
    expect(calculateAttendanceDelta(member.attendance)).toBe(0);
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
