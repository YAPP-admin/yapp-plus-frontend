/** 생성 Team SDK와 관리자 기능 사이의 팀원 요청 경계를 감싼다. 화면 모델 변환은 소비 계층의 책임이다. */
import {
  candidates,
  replaceMembers,
  type ReplaceTeamMembersRequest,
  type TeamMemberCandidateResponse,
  type TeamResponse,
} from '@yapp-plus/api/generated';

type DataResult<T> = Readonly<{ data?: T }>;

function requireData<T>(result: DataResult<T>, operation: string): T {
  if (result.data === undefined) {
    throw new Error(`${operation} 응답 본문이 없습니다.`);
  }
  return result.data;
}

/** 팀원을 전체 교체하고 갱신된 Team DTO를 반환한다. */
export async function replaceTeamMembers(
  generationId: number,
  teamId: number,
  body: ReplaceTeamMembersRequest,
): Promise<TeamResponse> {
  const result = await replaceMembers({
    path: { generationId, teamId },
    body,
    throwOnError: true,
  });
  return requireData(result, '팀원 교체');
}

/** 기수의 팀원 후보를 조회하며 assigned가 없으면 서버의 전체 후보 기본값을 사용한다. */
export async function listTeamMemberCandidates(
  generationId: number,
  assigned?: boolean,
): Promise<TeamMemberCandidateResponse[]> {
  const result = await candidates({
    path: { generationId },
    ...(assigned === undefined ? {} : { query: { assigned } }),
    throwOnError: true,
  });
  return requireData(result, '팀원 후보 조회');
}
