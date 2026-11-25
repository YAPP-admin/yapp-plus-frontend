import type * as Papa from 'papaparse';
import type * as XLSX from 'xlsx';

export const MAX_IMPORT_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 1000;
export const MEMBER_IMPORT_FILE_ACCEPT = '.csv,.xls,.xlsx';
export const memberImportHeaders = ['이름', '전화번호', '기수', '직군', '권한'] as const;

const SUPPORTED_IMPORT_FILE_EXTENSIONS = new Set(['.csv', '.xls', '.xlsx']);

export type MemberImportHeader = (typeof memberImportHeaders)[number];

export type MemberImportRow = {
  sourceRow: number;
  values: readonly string[];
};

export type ParsedMemberImportFile = {
  fileName: string;
  headers: readonly MemberImportHeader[];
  rows: readonly MemberImportRow[];
};

export type MemberImportFileErrorCode =
  | 'unsupported-type'
  | 'too-large'
  | 'empty'
  | 'invalid-header'
  | 'parse-failed';

export class MemberImportFileError extends Error {
  readonly code: MemberImportFileErrorCode;

  constructor(code: MemberImportFileErrorCode, message: string) {
    super(message);
    this.name = 'MemberImportFileError';
    this.code = code;
  }
}

type PapaModule = typeof Papa;
let papaModulePromise: Promise<PapaModule> | undefined;

type XlsxModule = typeof XLSX;
let xlsxModulePromise: Promise<XlsxModule> | undefined;

function loadPapaModule() {
  papaModulePromise ??= import('papaparse');
  return papaModulePromise;
}

/** XLS/XLSX 파일을 선택한 순간에만 Excel 파서를 불러온다. */
function loadXlsxModule() {
  xlsxModulePromise ??= import('xlsx');
  return xlsxModulePromise;
}

function extensionOf(fileName: string) {
  const dot = fileName.lastIndexOf('.');
  return dot === -1 ? '' : fileName.slice(dot).toLowerCase();
}

function hasValidHeader(row: readonly string[]) {
  return (
    row.length === memberImportHeaders.length &&
    memberImportHeaders.every((header, index) => row[index] === header)
  );
}

function removeTrailingLineRecord(rows: readonly string[][], text: string) {
  const last = rows.at(-1);
  if (text.endsWith('\n') && last?.length === 1 && last[0] === '') {
    return rows.slice(0, -1);
  }
  return rows;
}

/** Excel 셀 값을 화면 검증에 사용할 문자열로 변환한다. */
function toCellText(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  return '';
}

/** CSV 파일을 파싱해 헤더와 셀 문자열 배열로 변환한다. */
async function parseCsvRows(file: File) {
  const [papa, text] = await Promise.all([loadPapaModule(), file.text()]);
  const result = papa.parse<string[]>(text.replace(/^\uFEFF/, ''), {
    delimiter: ',',
    dynamicTyping: false,
    skipEmptyLines: false,
  });
  if (result.errors.length > 0) {
    throw new MemberImportFileError('parse-failed', 'CSV 파일을 읽지 못했어요.');
  }
  return removeTrailingLineRecord(result.data, text);
}

/** 첫 번째 워크시트를 읽어 CSV와 같은 셀 문자열 배열로 변환한다. */
async function parseSpreadsheetRows(file: File) {
  const xlsx = await loadXlsxModule();
  const workbook = xlsx.read(await file.arrayBuffer(), { type: 'array', raw: false });
  const firstSheetName = workbook.SheetNames.at(0);
  if (firstSheetName === undefined) {
    throw new MemberImportFileError('empty', '헤더가 없는 파일이에요.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  if (worksheet === undefined) {
    throw new MemberImportFileError('parse-failed', 'Excel 파일을 읽지 못했어요.');
  }

  const rows = xlsx.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    raw: false,
    defval: '',
    blankrows: true,
  });
  return rows.map((row) => row.map(toCellText));
}

/** CSV·XLS·XLSX 파일을 헤더·원본 행 번호만 가진 읽기 결과로 변환한다. */
export async function parseMemberImportFile(file: File): Promise<ParsedMemberImportFile> {
  const extension = extensionOf(file.name);
  if (!SUPPORTED_IMPORT_FILE_EXTENSIONS.has(extension)) {
    throw new MemberImportFileError(
      'unsupported-type',
      'CSV, XLS, XLSX 파일만 업로드할 수 있어요.',
    );
  }
  if (file.size > MAX_IMPORT_FILE_BYTES) {
    throw new MemberImportFileError('too-large', '파일 크기는 10MB 이하만 업로드할 수 있어요.');
  }
  if (file.size === 0) {
    throw new MemberImportFileError('empty', '빈 파일은 업로드할 수 없어요.');
  }

  try {
    const rows = extension === '.csv' ? await parseCsvRows(file) : await parseSpreadsheetRows(file);
    const header = rows.at(0);
    if (header === undefined || header.length === 0) {
      throw new MemberImportFileError('empty', '헤더가 없는 파일이에요.');
    }
    if (!hasValidHeader(header)) {
      throw new MemberImportFileError(
        'invalid-header',
        `첫 행은 ${memberImportHeaders.join('/')} 순서여야 해요.`,
      );
    }

    return {
      fileName: file.name,
      headers: memberImportHeaders,
      rows: rows.slice(1).map((values, index) => ({ sourceRow: index + 2, values })),
    };
  } catch (error) {
    if (error instanceof MemberImportFileError) {
      throw error;
    }
    throw new MemberImportFileError(
      'parse-failed',
      '파일을 읽지 못했어요. 파일을 다시 확인해 주세요.',
    );
  }
}
