import { memberImportHeaders } from './import-file';

const UTF8_BOM = '\uFEFF';

/** 파서와 같은 열 순서의 CSV 양식을 문자열로 만든다. 전화번호는 문자열 열로 안내한다. */
export function createMemberImportTemplate() {
  return `${UTF8_BOM}${memberImportHeaders.join(',')}\r\n`;
}

export function createMemberImportTemplateBlob() {
  return new Blob([createMemberImportTemplate()], { type: 'text/csv;charset=utf-8' });
}
