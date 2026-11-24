import type {
  GenerationRosterEntryRequest,
  RegisterGenerationRosterRequest,
} from '@yapp-plus/api/generated';
import {
  formatMemberPhoneNumber,
  type MemberPart,
  type MemberRole,
} from '~/features/member-management';
import type { ClassifiedMemberImportRow, MemberImportDuplicateAction } from './import-rows';

type ApiPosition = GenerationRosterEntryRequest['position'];
type ApiRole = GenerationRosterEntryRequest['role'];

const positionByMemberPart = {
  pm: 'PM',
  design: 'DESIGN',
  android: 'ANDROID',
  ios: 'IOS',
  web: 'WEB',
  mobile: 'MOBILE',
  server: 'SERVER',
  'ai-native': 'AI_NATIVE',
} satisfies Record<MemberPart, ApiPosition>;

const roleByMemberRole = {
  'active-member': 'PLAYER',
  'regular-member': 'OB',
  'completed-member': 'COMPLETED_MEMBER',
  'deferred-member': 'DEFERRED',
} satisfies Record<Exclude<MemberRole, 'admin'>, ApiRole>;

/** 화면의 직군·권한 값을 생성 SDK의 사전 명단 요청 enum으로 변환한다. */
function toApiRole(role: MemberRole): ApiRole {
  if (role === 'admin') {
    throw new Error('현재 사전 명단 등록 API는 admin 권한을 지원하지 않습니다.');
  }
  return roleByMemberRole[role];
}

/** 정상 행과 덮어쓰기로 선택한 중복 행만 사전 명단 등록 요청으로 만든다. */
export function buildMemberImportRegistrationRequest({
  generationId,
  rows,
  duplicateSelections,
}: {
  generationId: number;
  rows: readonly ClassifiedMemberImportRow[];
  duplicateSelections: Readonly<Record<number, MemberImportDuplicateAction>>;
}): RegisterGenerationRosterRequest {
  const entries = rows.flatMap<GenerationRosterEntryRequest>((row) => {
    if (row.status === 'error') {
      return [];
    }
    if (row.status === 'duplicate' && duplicateSelections[row.sourceRow] !== 'overwrite') {
      return [];
    }

    return [
      {
        clientRowId: String(row.sourceRow),
        generationId,
        name: row.name,
        phoneNumber: formatMemberPhoneNumber(row.phoneNumber),
        position: positionByMemberPart[row.part],
        role: toApiRole(row.role),
      },
    ];
  });

  return { generationId, entries };
}
