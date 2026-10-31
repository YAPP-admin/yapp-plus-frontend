import { expect, it } from 'vitest';
import type { MemberImportRow } from './import-file';
import {
  classifyMemberImportRows,
  summarizeMemberImportRows,
  validateMemberImportRows,
} from './import-rows';
import { memberPreviewAfterMapping } from '~/features/member-management/fixtures';

const row = (sourceRow: number, values: readonly string[]): MemberImportRow => ({
  sourceRow,
  values,
});

const validRow = (sourceRow: number, phoneNumber = '010-1234-5678', generation = '33') =>
  row(sourceRow, ['홍길동', phoneNumber, generation, 'pm', 'active-member']);

it('빈 행을 제외하고 값을 정리해 필드 오류와 원본 행을 반환한다', () => {
  const rows = validateMemberImportRows([
    row(2, ['', '', '', '', '']),
    row(3, ['  홍길동  ', '010-1234-5678', ' 33 ', 'pm', 'active-member']),
    row(4, ['이름', '01012345678', '33', 'pm']),
    row(5, ['이름', '010-123-5678', '33', 'pm', 'active-member']),
    row(6, ['이름', '01012345678', '0', 'pm', 'active-member']),
    row(7, ['이름', '01012345678', '33', 'unknown', 'active-member']),
    row(8, ['이름', '01012345678', '33', 'pm', 'unknown']),
  ]);

  expect(rows).toHaveLength(6);
  expect(rows[0]).toMatchObject({ status: 'valid', sourceRow: 3, name: '홍길동' });
  expect(rows.slice(1).map((item) => item.status)).toEqual([
    'error',
    'error',
    'error',
    'error',
    'error',
  ]);
  expect(rows.slice(1).map((item) => item.status === 'error' && item.error.code)).toEqual([
    'invalid-columns',
    'invalid-phone',
    'invalid-generation',
    'invalid-part',
    'invalid-role',
  ]);
});

it('유효한 첫 행만 파일 중복 집합에 넣고 오류 행 뒤의 유효 행은 허용한다', () => {
  const rows = validateMemberImportRows([
    row(2, ['', '01012345678', '33', 'pm', 'active-member']),
    validRow(3),
    validRow(4, '01012345678'),
  ]);

  expect(rows[0]).toMatchObject({ status: 'error', sourceRow: 2, error: { code: 'required' } });
  expect(rows[1]).toMatchObject({ status: 'valid', sourceRow: 3, phoneNumber: '01012345678' });
  expect(rows[2]).toMatchObject({
    status: 'error',
    sourceRow: 4,
    error: { code: 'duplicate-in-file', duplicateSourceRow: 3 },
  });
});

it('신규 회원·새 기수·기존 활동 중복을 구분한다', () => {
  const existingMember = memberPreviewAfterMapping.members.at(0);
  if (existingMember === undefined) {
    throw new Error('기존 회원 fixture가 필요합니다.');
  }
  const rows = validateMemberImportRows([
    validRow(2, '01099999999'),
    validRow(3, existingMember.phoneNumber, '34'),
    validRow(4, existingMember.phoneNumber, '33'),
  ]);

  const classified = classifyMemberImportRows(rows, memberPreviewAfterMapping.members);

  expect(classified[0]).toMatchObject({ status: 'normal', classification: 'new-member' });
  expect(classified[1]).toMatchObject({
    status: 'normal',
    classification: 'new-generation',
    memberId: existingMember.id,
  });
  expect(classified[2]).toMatchObject({
    status: 'duplicate',
    classification: 'existing-activity',
    duplicate: { memberId: existingMember.id, activityId: existingMember.activities[1]?.id },
  });
});

it('하이픈 유무를 같은 전화번호로 정규화하고 집계를 배타적으로 계산한다', () => {
  const existingMember = memberPreviewAfterMapping.members.at(0);
  if (existingMember === undefined) {
    throw new Error('기존 회원 fixture가 필요합니다.');
  }
  const rows = classifyMemberImportRows(
    validateMemberImportRows([
      validRow(2, '010-1234-5678'),
      validRow(3, '01012345678'),
      validRow(4, existingMember.phoneNumber),
    ]),
    memberPreviewAfterMapping.members,
  );

  expect(rows[1]).toMatchObject({ status: 'error', error: { code: 'duplicate-in-file' } });
  expect(rows[2]).toMatchObject({ status: 'duplicate', classification: 'existing-activity' });
  expect(summarizeMemberImportRows(rows, { 3: 'overwrite', 4: 'overwrite' })).toEqual({
    total: 3,
    normal: 1,
    error: 1,
    duplicate: 1,
    planned: 2,
  });
});
