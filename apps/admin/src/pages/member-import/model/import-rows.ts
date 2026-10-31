/**
 * CSV 파싱 결과를 화면에서 사용하는 행 검증·중복 분류 결과로 변환한다.
 * 이 모듈은 읽기 전용 회원 명단과 비교·집계만 수행하며 실제 저장은 하지 않는다.
 */
import {
  memberPartSchema,
  memberRoleSchema,
  memberPhoneNumberSchema,
  type Member,
  type MemberPart,
  type MemberRole,
} from '~/features/member-management';
import type { MemberImportRow } from './import-file';

/** 행 검증에서 사용자에게 안내할 오류의 종류다. */
export type MemberImportRowErrorCode =
  | 'invalid-columns'
  | 'required'
  | 'invalid-phone'
  | 'invalid-generation'
  | 'invalid-part'
  | 'invalid-role'
  | 'duplicate-in-file';

/** 오류 행의 원본 위치와 화면 안내 메시지다. */
export type MemberImportRowError = {
  /** 오류를 구분하는 코드다. */
  code: MemberImportRowErrorCode;
  /** 사용자가 수정할 수 있도록 표시할 오류 메시지다. */
  message: string;
  /** 파일 내부 중복이면 최초로 인정한 유효 행 번호다. */
  duplicateSourceRow?: number;
};

/** 모든 검증 결과가 유지해야 하는 CSV 원본 정보다. */
type MemberImportRowBase = {
  /** CSV 헤더를 포함한 원본 행 번호다. */
  sourceRow: MemberImportRow['sourceRow'];
  /** 표시·검증에 사용하는 양끝 공백 제거 후의 값이다. */
  values: readonly string[];
};

/** 검증을 통과한 행에서 사용하는 정규화된 회원 입력값이다. */
type ValidMemberImportRowFields = {
  /** 양끝 공백을 제거한 회원 이름이다. */
  name: string;
  /** 하이픈을 제거한 010 전화번호다. */
  phoneNumber: string;
  /** 양의 정수로 변환한 기수다. */
  generation: number;
  /** 허용된 직군 값이다. */
  part: MemberPart;
  /** 허용된 권한 값이다. */
  role: MemberRole;
};

/** 파일 내부 필드 검증이 끝난 행이다. status가 결과 형태를 판별한다. */
export type ValidatedMemberImportRow =
  | (MemberImportRowBase & {
      status: 'error';
      error: MemberImportRowError;
    })
  | (MemberImportRowBase & ValidMemberImportRowFields & { status: 'valid' });

/** 유효한 행이 기존 회원 명단과 비교된 결과의 분류다. */
export type MemberImportRowClassification = 'new-member' | 'new-generation' | 'existing-activity';

/** 파일 오류 또는 기존 명단 비교까지 완료한 최종 행 결과다. */
export type ClassifiedMemberImportRow =
  | Extract<ValidatedMemberImportRow, { status: 'error' }>
  | (MemberImportRowBase &
      ValidMemberImportRowFields & {
        status: 'normal';
        classification: Exclude<MemberImportRowClassification, 'existing-activity'>;
        memberId?: string;
      })
  | (MemberImportRowBase &
      ValidMemberImportRowFields & {
        status: 'duplicate';
        classification: 'existing-activity';
        duplicate: {
          memberId: string;
          activityId: string;
        };
      });

/** 기존 활동 중복 행에 적용할 처리 방법이다. 기본값은 skip이다. */
export type MemberImportDuplicateAction = 'skip' | 'overwrite';

/** 화면 상단에 표시할 행별 집계와 반영 예정 수다. */
export type MemberImportSummary = {
  /** 빈 행을 제외한 전체 데이터 행 수다. */
  total: number;
  /** 신규 회원·새 기수로 분류된 정상 행 수다. */
  normal: number;
  /** 필드 오류 또는 파일 내부 중복 행 수다. */
  error: number;
  /** 기존 활동과 겹쳐 선택이 필요한 행 수다. */
  duplicate: number;
  /** 정상 행과 덮어쓰기로 선택한 중복 행의 합이다. */
  planned: number;
};

/** 원본 행 정보를 유지한 오류 결과를 만든다. */
function errorRow(
  sourceRow: number,
  values: readonly string[],
  error: MemberImportRowError,
): Extract<ValidatedMemberImportRow, { status: 'error' }> {
  return { sourceRow, values, status: 'error', error };
}

/** 한 행의 열 구조와 회원 입력 필드를 검증한다. */
function validateRow(row: MemberImportRow, values: readonly string[]): ValidatedMemberImportRow {
  if (values.length !== 5) {
    return errorRow(row.sourceRow, values, {
      code: 'invalid-columns',
      message: '이름·전화번호·기수·직군·권한 다섯 열이 필요해요.',
    });
  }

  const name = values[0] ?? '';
  const phoneNumber = values[1] ?? '';
  const generation = values[2] ?? '';
  const part = values[3] ?? '';
  const role = values[4] ?? '';
  if ([name, phoneNumber, generation, part, role].some((value) => value === '')) {
    return errorRow(row.sourceRow, values, {
      code: 'required',
      message: '모든 항목을 입력해 주세요.',
    });
  }

  const parsedPhoneNumber = memberPhoneNumberSchema.safeParse(phoneNumber);
  if (!parsedPhoneNumber.success) {
    return errorRow(row.sourceRow, values, {
      code: 'invalid-phone',
      message: '전화번호 형식을 확인해 주세요.',
    });
  }

  const parsedGeneration = Number(generation);
  if (
    !/^\d+$/.test(generation) ||
    !Number.isSafeInteger(parsedGeneration) ||
    parsedGeneration <= 0
  ) {
    return errorRow(row.sourceRow, values, {
      code: 'invalid-generation',
      message: '기수는 양의 정수로 입력해 주세요.',
    });
  }

  const parsedPart = memberPartSchema.safeParse(part);
  if (!parsedPart.success) {
    return errorRow(row.sourceRow, values, {
      code: 'invalid-part',
      message: '직군 값을 확인해 주세요.',
    });
  }

  const parsedRole = memberRoleSchema.safeParse(role);
  if (!parsedRole.success) {
    return errorRow(row.sourceRow, values, {
      code: 'invalid-role',
      message: '권한 값을 확인해 주세요.',
    });
  }

  return {
    sourceRow: row.sourceRow,
    values,
    status: 'valid',
    name,
    phoneNumber: parsedPhoneNumber.data,
    generation: parsedGeneration,
    part: parsedPart.data,
    role: parsedRole.data,
  };
}

/** CSV 행을 정리하고 필드·전화번호·기수·직군·권한을 검증한다. */
export function validateMemberImportRows(
  rows: readonly MemberImportRow[],
): readonly ValidatedMemberImportRow[] {
  const seenKeys = new Map<string, number>();

  return rows.reduce<ValidatedMemberImportRow[]>((result, row) => {
    const values = row.values.map((value) => value.trim());
    if (values.every((value) => value === '')) {
      return result;
    }

    const validatedRow = validateRow(row, values);
    if (validatedRow.status === 'error') {
      result.push(validatedRow);
      return result;
    }

    const key = `${validatedRow.phoneNumber}:${validatedRow.generation}`;
    const firstSourceRow = seenKeys.get(key);
    if (firstSourceRow !== undefined) {
      result.push(
        errorRow(row.sourceRow, values, {
          code: 'duplicate-in-file',
          message: '같은 전화번호·기수의 유효한 행이 이미 있어요.',
          duplicateSourceRow: firstSourceRow,
        }),
      );
      return result;
    }

    seenKeys.set(key, row.sourceRow);
    result.push(validatedRow);
    return result;
  }, []);
}

/** 검증된 행을 신규 회원·새 기수·기존 활동 중복으로 분류한다. */
export function classifyMemberImportRows(
  rows: readonly ValidatedMemberImportRow[],
  members: readonly Member[],
): readonly ClassifiedMemberImportRow[] {
  return rows.map((row) => {
    if (row.status === 'error') {
      return row;
    }

    const member = members.find((item) => item.phoneNumber === row.phoneNumber);
    if (member === undefined) {
      return { ...row, status: 'normal', classification: 'new-member' };
    }

    const activity = member.activities.find((item) => item.generation === row.generation);
    if (activity !== undefined) {
      return {
        ...row,
        status: 'duplicate',
        classification: 'existing-activity',
        duplicate: { memberId: member.id, activityId: activity.id },
      };
    }

    return {
      ...row,
      status: 'normal',
      classification: 'new-generation',
      memberId: member.id,
    };
  });
}

/** 정상·오류·중복과 선택된 중복 덮어쓰기를 포함한 반영 예정 수를 계산한다. */
export function summarizeMemberImportRows(
  rows: readonly ClassifiedMemberImportRow[],
  duplicateActions: Readonly<Record<number, MemberImportDuplicateAction>> = {},
): MemberImportSummary {
  const counts = rows.reduce(
    (summary, row) => {
      summary.total += 1;
      if (row.status === 'normal') {
        summary.normal += 1;
      } else if (row.status === 'error') {
        summary.error += 1;
      } else {
        summary.duplicate += 1;
      }
      return summary;
    },
    { total: 0, normal: 0, error: 0, duplicate: 0, planned: 0 },
  );

  const overwriteCount = rows.filter(
    (row) => row.status === 'duplicate' && duplicateActions[row.sourceRow] === 'overwrite',
  ).length;
  return { ...counts, planned: counts.normal + overwriteCount };
}
