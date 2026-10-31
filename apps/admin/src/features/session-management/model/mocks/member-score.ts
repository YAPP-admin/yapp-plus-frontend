import type {
  AttendanceScoreEntry,
  MemberScoreViewModel,
  ScoreAdjustment,
} from '../attendance-view-model';

/** 모의 서비스 전용 합계입니다. 실제 ViewModel은 서버의 누적 점수를 재계산하지 않습니다. */
export function createMockMemberScore(
  membershipId: string,
  name: string,
  attendanceEntries: AttendanceScoreEntry[],
  adjustmentEntries: ScoreAdjustment[],
  part: string | null = null,
): MemberScoreViewModel {
  const attendanceScore = attendanceEntries.reduce<number | null>(
    (sum, { score }) => (sum === null || score.delta === null ? null : sum + score.delta),
    100,
  );
  const adjustmentScore = adjustmentEntries.reduce((sum, { delta }) => sum + delta, 0);
  const totalScore = attendanceScore === null ? null : attendanceScore + adjustmentScore;

  return {
    membershipId,
    name,
    part,
    initialScore: 100,
    attendanceEntries: structuredClone(attendanceEntries),
    adjustmentEntries: structuredClone(adjustmentEntries),
    totalScore,
    warning: totalScore === null ? null : totalScore < 40,
  };
}

const mockScoreParts = ['pm', 'design', 'android', 'ios', 'web', 'server'] as const;
const mockScoreSessions = [
  ['mock-score-session-1', '출석 세션 1'],
  ['mock-score-session-2', '출석 세션 2'],
  ['mock-score-session-3', '출석 세션 3'],
  ['mock-score-session-4', '출석 세션 4'],
  ['mock-score-session-5', '출석 세션 5'],
] as const;

/** 실제 관리자 총점 API가 연결되기 전 화면 상태를 확인하기 위한 고정 예시입니다. */
export function createMockMemberScores(): MemberScoreViewModel[] {
  return Array.from({ length: 40 }, (_, index) => {
    const isLowScore = index === 0 || index === 13;
    const hasUnknownScore = index === 7 || index === 27;
    const penalty = isLowScore ? [20, 20, 18, 16, 15] : [index % 4, 0, 2, 0, 1];
    const attendanceEntries = mockScoreSessions.map(([sessionId, title], entryIndex) => {
      const delta = hasUnknownScore && entryIndex === 2 ? null : -(penalty[entryIndex] ?? 0);
      return {
        sessionId,
        title,
        score:
          delta === null
            ? { source: 'unknown' as const, delta: null, description: '서버 점수 확인 필요' }
            : { source: 'mock' as const, delta, description: 'mock 출결 점수' },
      };
    });
    const adjustmentEntries: ScoreAdjustment[] =
      index % 10 === 0
        ? [
            {
              id: `mock-adjustment-${index + 1}`,
              kind: 'fee',
              delta: -5,
              description: '예시 운영 조정',
            },
          ]
        : [];
    return createMockMemberScore(
      `mock-member-${index + 1}`,
      `가상 회원 ${index + 1}`,
      attendanceEntries,
      adjustmentEntries,
      mockScoreParts[index % mockScoreParts.length] ?? null,
    );
  });
}
