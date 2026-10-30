import type { AttendanceMemberViewModel, TeamReviewViewModel } from '../attendance-view-model';
import type { Session } from '../session';

// 사진 업로드·검수 API가 연결되기 전 화면 흐름을 확인하기 위한 가상 검수 자료입니다.
export function createMockTeamReviews(
  session: Session,
  members: AttendanceMemberViewModel[],
): TeamReviewViewModel[] {
  const grouped = new Map<string, AttendanceMemberViewModel[]>();
  members.forEach((member) => {
    if (!member.teamId) {
      return;
    }
    const teamMembers = grouped.get(member.teamId) ?? [];
    teamMembers.push(member);
    grouped.set(member.teamId, teamMembers);
  });

  return [...grouped.entries()].map(([teamId, teamMembers], index) => {
    let reviewState: 'pending' | 'approved' | 'rejected' | 'notSubmitted' = 'notSubmitted';
    if (index === 0) {
      reviewState = 'pending';
    } else if (index === 1) {
      reviewState = 'approved';
    } else if (index === 2) {
      reviewState = 'rejected';
    }
    const teamName = `개발용 팀 ${index + 1}`;
    if (reviewState === 'notSubmitted') {
      return {
        teamId,
        teamName,
        members: teamMembers,
        reviewState,
        photo: null,
        decisionDraft: null,
      };
    }

    const photoId = `${session.id}-${teamId}-photo`;
    return {
      teamId,
      teamName,
      members: teamMembers,
      reviewState,
      photo: {
        photoId,
        uploaderName: teamMembers[0]?.name ?? null,
        submittedAt: `${session.date}T15:00:00+09:00`,
        selectedMembershipIds: teamMembers.slice(0, 3).map((member) => member.membershipId),
        access: 'available',
        readUrl: `https://example.invalid/admin/attendance/${session.id}/photos/${photoId}`,
      },
      decisionDraft: null,
    };
  });
}
