/** 회원용 대상 조회 전까지 개발 Activity에만 고정 제출 대상을 공급한다. */
import { teamAttendanceTargetSchema } from '@/features/team-attendance';

/** 팀 인증의 모든 개발 진입점에 동일한 빌드·모의 조건을 적용한다. */
export const teamPhotoDevelopmentEnabled = () =>
  import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true';

/** 회원 조회 API가 준비되기 전까지 개발 Activity에만 공급하는 명단이다. */
export const developmentTeamTarget = import.meta.env.DEV
  ? teamAttendanceTargetSchema.parse({
      sessionId: 1,
      teamName: '개발용 Web 팀',
      selfMembershipId: 2,
      members: [
        { membershipId: 1, name: '강야뿌', positionLabel: 'PM' },
        { membershipId: 2, name: '김야뿌', positionLabel: 'Design' },
        { membershipId: 3, name: '이야뿌', positionLabel: 'Android' },
        { membershipId: 4, name: '박야뿌', positionLabel: 'iOS' },
        { membershipId: 5, name: '최야뿌', positionLabel: 'Server' },
      ],
    })
  : null;
