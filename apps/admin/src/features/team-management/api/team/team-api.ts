/** 생성 Team SDK와 관리자 기능 사이의 팀 요청 경계를 감싼다. 화면 모델 변환은 소비 계층의 책임이다. */
import {
  create1,
  delete_,
  find,
  findAll,
  update,
  type CreateTeamRequest,
  type TeamResponse,
  type UpdateTeamRequest,
} from '@yapp-plus/api/generated';

type DataResult<T> = Readonly<{ data?: T }>;

function requireData<T>(result: DataResult<T>, operation: string): T {
  if (result.data === undefined) {
    throw new Error(`${operation} 응답 본문이 없습니다.`);
  }
  return result.data;
}

/** 기수의 활성 팀 목록을 generated Team DTO로 반환한다. 화면 모델로 변환하지 않는다. */
export async function listTeams(generationId: number): Promise<TeamResponse[]> {
  const result = await findAll({
    path: { generationId },
    throwOnError: true,
  });
  return requireData(result, '팀 목록 조회');
}

/** 기수에 새 팀을 생성하고 서버가 만든 Team DTO를 반환한다. */
export async function createTeam(
  generationId: number,
  body: CreateTeamRequest,
): Promise<TeamResponse> {
  const result = await create1({
    path: { generationId },
    body,
    throwOnError: true,
  });
  return requireData(result, '팀 생성');
}

/** 기수에서 특정 팀을 조회한다. teamId는 body나 화면 상태에서 추출하지 않는다. */
export async function getTeam(generationId: number, teamId: number): Promise<TeamResponse> {
  const result = await find({
    path: { generationId, teamId },
    throwOnError: true,
  });
  return requireData(result, '팀 상세 조회');
}

/** 팀 이름·서비스명을 generated 수정 DTO로 전달하고 갱신된 Team DTO를 반환한다. */
export async function updateTeam(
  generationId: number,
  teamId: number,
  body: UpdateTeamRequest,
): Promise<TeamResponse> {
  const result = await update({
    path: { generationId, teamId },
    body,
    throwOnError: true,
  });
  return requireData(result, '팀 수정');
}

/** 팀을 soft delete한다. 성공 응답 본문은 없는 204다. */
export async function deleteTeam(generationId: number, teamId: number): Promise<void> {
  await delete_({
    path: { generationId, teamId },
    throwOnError: true,
  });
}
