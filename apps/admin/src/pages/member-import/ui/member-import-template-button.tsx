import { ActionButton } from '@yapp-plus/ui';
import { createMemberImportTemplateBlob } from '../model/import-template';

export function MemberImportTemplateButton() {
  return (
    <ActionButton type="button" variant="neutralWeak" onClick={downloadTemplate}>
      양식 다운로드
    </ActionButton>
  );
}

function downloadTemplate() {
  const url = URL.createObjectURL(createMemberImportTemplateBlob());
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'yapp-member-import-template.csv';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
