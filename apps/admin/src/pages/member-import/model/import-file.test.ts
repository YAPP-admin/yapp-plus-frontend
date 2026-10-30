import { expect, it } from 'vitest';
import { MAX_IMPORT_FILE_BYTES, memberImportHeaders, parseMemberImportFile } from './import-file';
import type { MemberImportFileError } from './import-file';
import { createMemberImportTemplate, createMemberImportTemplateBlob } from './import-template';

const memberRows = [
  memberImportHeaders.join(','),
  '"홍길동","010-1234-5678",33,pm,active-member',
  ',,,,',
  '김철수,01012345678,33,design,regular-member',
].join('\r\n');

function csvFile(name: string, content: string) {
  return new File([content], name, { type: 'text/csv' });
}

it('CSV 파일을 읽고 인용부호·숫자 형태를 문자열로 보존한다', async () => {
  const result = await parseMemberImportFile(csvFile('members.csv', memberRows));

  expect(result.fileName).toBe('members.csv');
  expect(result.headers).toEqual(memberImportHeaders);
  expect(result.rows.map((row) => row.sourceRow)).toEqual([2, 3, 4]);
  expect(result.rows[0]?.values).toEqual(['홍길동', '010-1234-5678', '33', 'pm', 'active-member']);
});

it('CSV의 인용 필드 안 쉼표와 줄바꿈을 하나의 값으로 읽는다', async () => {
  const result = await parseMemberImportFile(
    csvFile(
      'members.csv',
      `${memberImportHeaders.join(',')}\n"홍,길동","01012345678",33,pm,"활동\n회원"`,
    ),
  );

  expect(result.rows[0]?.values).toEqual(['홍,길동', '01012345678', '33', 'pm', '활동\n회원']);
});

it.each([
  ['members.txt', 'unsupported-type'],
  ['members.csv', 'too-large'],
  ['members.csv', 'empty'],
  ['members.csv', 'invalid-header'],
] as const)('%s 입력의 %s 오류를 구분한다', async (name, code) => {
  let file: File;
  if (code === 'too-large') {
    file = new File([new Uint8Array(MAX_IMPORT_FILE_BYTES + 1)], name);
  } else if (code === 'empty') {
    file = new File([], name);
  } else if (code === 'invalid-header') {
    file = csvFile(name, '전화번호,이름\n010,홍길동');
  } else {
    file = new File(['내용'], name);
  }
  await expect(parseMemberImportFile(file)).rejects.toMatchObject({
    code,
  } satisfies Pick<MemberImportFileError, 'code'>);
});

it('손상된 CSV를 파서 오류로 반환한다', async () => {
  await expect(
    parseMemberImportFile(csvFile('members.csv', `${memberImportHeaders.join(',')}\n"손상된 내용`)),
  ).rejects.toMatchObject({
    code: 'parse-failed',
  });
});

it('전화번호 앞자리를 보존하는 CSV 양식을 만든다', async () => {
  expect(createMemberImportTemplate()).toBe(`\uFEFF${memberImportHeaders.join(',')}\r\n`);
  const blob = createMemberImportTemplateBlob();
  expect(blob.type).toBe('text/csv;charset=utf-8');
  expect(await blob.text()).toContain('전화번호');
});
