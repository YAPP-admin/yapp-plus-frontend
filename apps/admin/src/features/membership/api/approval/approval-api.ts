/** 가입 심사·명단 후보 API를 생성된 OpenAPI SDK에 연결하는 adapter다. */

import {
  approve,
  findCandidates,
  findDetail,
  findPending,
  reject,
  type ApproveData,
  type FindCandidatesData,
  type FindDetailData,
  type FindPendingData,
  type RejectData,
} from '@yapp-plus/api/generated';

/** 가입 심사 목록의 상태·페이지 필터다. */
export type MembershipApprovalListQuery = FindPendingData['query'];

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
