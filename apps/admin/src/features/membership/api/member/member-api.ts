/** 회원·팀 선택지 API를 생성된 OpenAPI SDK에 연결하는 adapter다. */

import {
  correct,
  detail,
  list5,
  teamOptions,
  type CorrectData,
  type DetailData,
  type List5Data,
  type TeamOptionsData,
} from '@yapp-plus/api/generated';

/** 회원 목록의 이름·직군·팀·커서 필터다. */
export type MemberListQuery = List5Data['query'];

/** generationId로 회원 목록을 필터와 함께 조회한다. */
export function getMembers(
  generationId: List5Data['path']['generationId'],
  query?: MemberListQuery,
) {
  return list5({
    path: { generationId },
    query,
    throwOnError: true,
  }).then(({ data }) => data);
}

/** generationId와 memberId로 회원의 수정 이력 포함 상세를 조회한다. */
export function getMember(
  generationId: DetailData['path']['generationId'],
  memberId: DetailData['path']['memberId'],
) {
  return detail({
    path: { generationId, memberId },
    throwOnError: true,
  }).then(({ data }) => data);
}

/** 회원 상태·직군을 generated update DTO로 전체 대체한다. */
export function updateMember(
  generationId: CorrectData['path']['generationId'],
  memberId: CorrectData['path']['memberId'],
  body: CorrectData['body'],
) {
  return correct({
    path: { generationId, memberId },
    body,
    throwOnError: true,
  }).then(({ data }) => data);
}

/** 회원 목록에서 사용할 활성 팀 선택지를 조회한다. */
export function getMemberTeamOptions(generationId: TeamOptionsData['path']['generationId']) {
  return teamOptions({
    path: { generationId },
    throwOnError: true,
  }).then(({ data }) => data);
}
