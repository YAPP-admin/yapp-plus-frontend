/**
 * 회원 관리 API를 생성된 OpenAPI SDK에 연결하는 adapter다.
 * 화면 모델이나 오류를 새로 만들지 않고 generated DTO를 그대로 전달하며,
 * generationId는 호출자가 요청 범위를 명시하도록 함수 인자로 받는다.
 */

import {
  approve,
  correct,
  detail,
  findCandidates,
  findDetail,
  findPending,
  list4,
  list5,
  register2,
  reject,
  teamOptions,
  type ApproveData,
  type CorrectData,
  type DetailData,
  type FindCandidatesData,
  type FindDetailData,
  type FindPendingData,
  type List4Data,
  type List5Data,
  type Register2Data,
  type RejectData,
  type TeamOptionsData,
} from '@yapp-plus/api/generated';

/** 회원 목록의 이름·직군·팀·커서 필터다. */
export type MemberListQuery = List5Data['query'];

/** 사전 명단 목록의 커서 필터다. */
export type RosterEntryListQuery = List4Data['query'];

/** 가입 심사 목록의 상태·페이지 필터다. */
export type MembershipApprovalListQuery = FindPendingData['query'];

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

/** 해당 기수에서 가입 심사에 사용할 수 있는 사전 명단을 커서 조회한다. */
export function getRosterEntries(
  generationId: List4Data['path']['generationId'],
  query?: RosterEntryListQuery,
) {
  return list4({
    path: { generationId },
    query,
    throwOnError: true,
  }).then(({ data }) => data);
}

/** 해당 기수의 사전 명단을 원자적으로 등록한다. */
export function registerRoster(
  generationId: Register2Data['path']['generationId'],
  body: Register2Data['body'],
) {
  return register2({
    path: { generationId },
    body,
    throwOnError: true,
  }).then(({ data }) => data);
}

/** PENDING·REJECTED 가입 심사 회원을 커서 조회한다. */
export function getMembershipApprovals(query?: MembershipApprovalListQuery) {
  return findPending({
    query,
    throwOnError: true,
  }).then(({ data }) => data);
}

/** 가입 심사 회원의 상세를 조회한다. */
export function getMembershipApproval(memberId: FindDetailData['path']['memberId']) {
  return findDetail({
    path: { memberId },
    throwOnError: true,
  }).then(({ data }) => data);
}

/** 회원 이름·전화번호와 일치하는 선택 기수의 명단 후보를 조회한다. */
export function getRosterCandidates(
  generationId: FindCandidatesData['query']['generationId'],
  memberId: FindCandidatesData['path']['memberId'],
) {
  return findCandidates({
    path: { memberId },
    query: { generationId },
    throwOnError: true,
  }).then(({ data }) => data);
}

/** 가입 심사 회원을 승인하고 생성된 회원 상세를 반환한다. */
export function approveMembership(
  memberId: ApproveData['path']['memberId'],
  body: ApproveData['body'],
) {
  return approve({
    path: { memberId },
    body,
    throwOnError: true,
  }).then(({ data }) => data);
}

/** 가입 심사 회원을 거절하고 변경된 회원 상세를 반환한다. */
export function rejectMembership(
  memberId: RejectData['path']['memberId'],
  body: RejectData['body'],
) {
  return reject({
    path: { memberId },
    body,
    throwOnError: true,
  }).then(({ data }) => data);
}
