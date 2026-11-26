/** 본인 출결과 최신 사진을 조합하는 결과 정책을 네트워크·UI와 독립적으로 검증합니다. */
import { describe, expect, it } from 'vitest';
import {
  fakeAttendanceHistoryItemResponse,
  fakeCurrentGenerationSessionItemResponse,
  fakeCurrentWeekSessionDetailResponse,
  fakeUserTeamPhotoDetailResponse,
} from '@yapp-plus/api/generated/faker';
import type {
  AttendanceHistoryItemResponse,
  UserTeamPhotoResponse,
} from '@yapp-plus/api/generated';
import { koreanTimestamp } from '@/shared/lib/korean-date-time';
import { toTeamAttendanceResult } from './team-attendance-result';

const SESSION = {
  ...fakeCurrentGenerationSessionItemResponse(),
  sessionId: 101,
  type: 'TEAM' as const,
  date: '2026-11-26',
  startTime: '14:00',
  endTime: '18:00',
};
const WEEK = {
  weekStartDate: '2026-11-22',
  weekEndDate: '2026-11-28',
  session: {
    ...fakeCurrentWeekSessionDetailResponse(),
    ...SESSION,
    attendanceStatus: 'AVAILABLE' as const,
  },
};
const ATTENDANCE = {
  ...fakeAttendanceHistoryItemResponse(),
  sessionId: 101,
  attendanceStatus: 'UNDECIDED' as const,
  staffDecisionStatus: 'REJECTED' as const,
};
const PHOTO = {
  photo: {
    ...fakeUserTeamPhotoDetailResponse(),
    photoId: 203,
    status: 'REJECTED' as const,
    rejectionReason: null,
    imageUrl: null,
  },
};
const NOW = koreanTimestamp(SESSION.date, '15:00');

describe('본인 팀 세션 결과', () => {
  it.each<AttendanceHistoryItemResponse['attendanceStatus']>([
    'PRESENT',
    'LATE',
    'EARLY_LEAVE',
    'LATE_AND_EARLY_LEAVE',
    'ABSENT',
  ])('확정 출결 %s는 팀 반려보다 우선한다', (attendanceStatus) => {
    expect(
      toTeamAttendanceResult(SESSION, { ...ATTENDANCE, attendanceStatus }, PHOTO, WEEK, NOW)?.kind,
    ).toBe(attendanceStatus === 'ABSENT' ? 'ABSENT' : 'COMPLETED');
  });
  it.each<AttendanceHistoryItemResponse['staffDecisionStatus']>([
    'NOT_SELECTED',
    'NOT_SUBMITTED',
    'APPROVED',
    'PENDING',
    null,
  ])('개인 상태 %s만으로 반려를 추측하지 않는다', (staffDecisionStatus) => {
    expect(
      toTeamAttendanceResult(SESSION, { ...ATTENDANCE, staffDecisionStatus }, PHOTO, WEEK, NOW),
    ).toBeNull();
  });
  it.each<UserTeamPhotoResponse>([
    { photo: null },
    { photo: { ...PHOTO.photo, status: 'PENDING' } },
    { photo: { ...PHOTO.photo, status: 'APPROVED' } },
  ])('최신 사진 반려가 없으면 보류한다: %j', (photo) => {
    expect(toTeamAttendanceResult(SESSION, ATTENDANCE, photo, WEEK, NOW)).toBeNull();
  });
  it('공결은 표시하지 않는다', () => {
    expect(
      toTeamAttendanceResult(
        SESSION,
        { ...ATTENDANCE, attendanceStatus: 'EXCUSED_ABSENCE' },
        PHOTO,
        WEEK,
        NOW,
      ),
    ).toBeNull();
  });
  it('사진 없음은 확정 출결의 null ID로 보존한다', () => {
    expect(
      toTeamAttendanceResult(
        SESSION,
        { ...ATTENDANCE, attendanceStatus: 'ABSENT' },
        { photo: null },
        WEEK,
        NOW,
      ),
    ).toMatchObject({ kind: 'ABSENT', photoId: null });
  });
  it('URL·사유가 없어도 사진 ID와 반려를 보존한다', () => {
    expect(toTeamAttendanceResult(SESSION, ATTENDANCE, PHOTO, WEEK, NOW)).toMatchObject({
      kind: 'REJECTED',
      photoId: 203,
      reupload: 'AVAILABLE',
    });
  });
  it('마감 시각부터 재업로드 기한이 종료된다', () => {
    expect(
      toTeamAttendanceResult(
        SESSION,
        ATTENDANCE,
        PHOTO,
        WEEK,
        koreanTimestamp(SESSION.date, SESSION.endTime),
      ),
    ).toMatchObject({ reupload: 'EXPIRED' });
  });
  it('다른 주간 세션이나 제출 불가 상태는 재업로드하지 않는다', () => {
    for (const session of [
      null,
      { ...WEEK.session, sessionId: 102 },
      { ...WEEK.session, attendanceStatus: 'CHECKED_IN' as const },
    ]) {
      expect(
        toTeamAttendanceResult(SESSION, ATTENDANCE, PHOTO, { ...WEEK, session }, NOW),
      ).toMatchObject({ reupload: 'UNAVAILABLE' });
    }
  });
  it('시작 전·정규 세션·다른 세션 내역은 표시하지 않는다', () => {
    expect(
      toTeamAttendanceResult(
        SESSION,
        ATTENDANCE,
        PHOTO,
        WEEK,
        koreanTimestamp(SESSION.date, '13:40'),
      ),
    ).toBeNull();
    expect(
      toTeamAttendanceResult({ ...SESSION, type: 'REGULAR' }, ATTENDANCE, PHOTO, WEEK, NOW),
    ).toBeNull();
    expect(
      toTeamAttendanceResult(SESSION, { ...ATTENDANCE, sessionId: 102 }, PHOTO, WEEK, NOW),
    ).toBeNull();
    expect(
      toTeamAttendanceResult(
        SESSION,
        ATTENDANCE,
        PHOTO,
        WEEK,
        koreanTimestamp(SESSION.date, '14:00'),
      ),
    ).not.toBeNull();
  });
});

it('서버 반려 사유는 표시 모델에 포함하지 않는다', () => {
  const result = toTeamAttendanceResult(
    SESSION,
    ATTENDANCE,
    { photo: { ...PHOTO.photo, rejectionReason: '서버의 별도 사유' } },
    WEEK,
    NOW,
  );
  expect(result).not.toHaveProperty('reason');
});
