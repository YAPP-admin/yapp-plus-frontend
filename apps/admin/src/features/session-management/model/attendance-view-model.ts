import type { AttendanceResult, BadgeViewModel, PriorReportViewModel } from './attendance';
import type { TeamDecisionInput } from './attendance-input';

export type AttendanceSummary = {
  total: number;
  present: number;
  late: number;
  earlyLeave: number;
  absent: number;
  undecided: number;
  reported: number;
};

export type AttendanceSessionViewModel = {
  id: string;
  generationId: string;
  title: string;
  type: 'offline' | 'team';
  startsAt: string;
  endsAt: string;
  phase: 'open' | 'closed' | 'unknown';
  canCancelClose: boolean;
  summary: AttendanceSummary;
};

export type AttendanceScoreViewModel = {
  description: string;
} & ({ source: 'mock' | 'server'; delta: number } | { source: 'unknown'; delta: null });

export type AttendanceMemberViewModel = {
  membershipId: string;
  name: string;
  part: string | null;
  teamId: string | null;
  attendance: AttendanceResult;
  latestReport: PriorReportViewModel | null;
  badge: BadgeViewModel;
  score: AttendanceScoreViewModel;
  isEditable: boolean;
};

export type AttendanceHistoryEntry = {
  id: string;
  membershipId: string;
  changedAt: string | null;
  actorName: string | null;
  before: AttendanceResult;
  after: AttendanceResult;
  reason: string | null;
};

export type TeamPhotoViewModel = {
  photoId: string;
  uploaderName: string | null;
  submittedAt: string;
  selectedMembershipIds: string[];
} & ({ access: 'available'; readUrl: string } | { access: 'unavailable'; readUrl: string | null });

// 사진 접근 실패는 미제출 상태로 바꾸지 않습니다.
export type TeamReviewViewModel = {
  teamId: string;
  teamName: string;
  members: AttendanceMemberViewModel[];
} & (
  | { reviewState: 'notSubmitted'; photo: null; decisionDraft: null }
  | {
      reviewState: 'pending' | 'approved' | 'rejected';
      photo: TeamPhotoViewModel;
      decisionDraft: TeamDecisionInput | null;
    }
  | { reviewState: 'unknown'; photo: TeamPhotoViewModel | null; decisionDraft: null }
);

export type AttendanceScoreEntry = {
  sessionId: string;
  title: string;
  score: AttendanceScoreViewModel;
};

export type ScoreAdjustment = {
  id: string;
  kind: 'fee' | 'waiver' | 'other';
  delta: number;
  description: string;
};

export type MemberScoreViewModel = {
  membershipId: string;
  name: string;
  initialScore: 100;
  attendanceEntries: AttendanceScoreEntry[];
  adjustmentEntries: ScoreAdjustment[];
  totalScore: number | null;
  warning: boolean | null;
};

export type AttendanceCodeViewModel =
  | { state: 'notIssued'; code: null; expiresAt: null }
  | { state: 'active'; code: string; expiresAt: string }
  | { state: 'expired'; code: string | null; expiresAt: string };
