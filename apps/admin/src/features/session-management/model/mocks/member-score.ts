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
    initialScore: 100,
    attendanceEntries: structuredClone(attendanceEntries),
    adjustmentEntries: structuredClone(adjustmentEntries),
    totalScore,
    warning: totalScore === null ? null : totalScore < 40,
  };
}
