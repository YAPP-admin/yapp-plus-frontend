/** 기수 사전 명단 API를 생성된 OpenAPI SDK에 연결하는 adapter다. */

import { list5, register2, type List5Data, type Register2Data } from '@yapp-plus/api/generated';

/** 사전 명단 목록의 커서 필터다. */
export type RosterEntryListQuery = List5Data['query'];

/** 해당 기수에서 가입 심사에 사용할 수 있는 사전 명단을 커서 조회한다. */
export function getRosterEntries(
  generationId: List5Data['path']['generationId'],
  query?: RosterEntryListQuery,
) {
  return list5({
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
