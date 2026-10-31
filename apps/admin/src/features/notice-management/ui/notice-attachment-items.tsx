/** 작성·수정·상세에서 같은 SEED 이미지 미리보기와 파일명을 표시한다. */
import { AttachmentInput, Text, VStack, type AttachmentInputFileEntry } from '@seed-design/react';
import { X } from 'lucide-react';
import * as styles from './notice-attachment-input.css';

/** 객체 URL 수명은 Item에 위임하고 편집 화면에서만 제거 버튼을 제공한다. */
export function NoticeAttachmentItems({
  entries,
  readOnly = false,
  disabled = false,
}: {
  entries: AttachmentInputFileEntry[];
  readOnly?: boolean;
  disabled?: boolean;
}) {
  return (
    <AttachmentInput.ItemGroup aria-label="첨부 이미지 목록">
      {entries.map((entry) => (
        <li key={entry.id} className={styles.item}>
          <VStack gap="x2">
            <AttachmentInput.Item fileEntry={entry} asChild>
              <div>
                <AttachmentInput.ItemImage />
                {!readOnly && (
                  <AttachmentInput.ItemRemoveButton
                    disabled={disabled}
                    aria-label={`${entry.file.name} 제거`}
                  >
                    <X size={16} aria-hidden="true" />
                  </AttachmentInput.ItemRemoveButton>
                )}
              </div>
            </AttachmentInput.Item>
            <Text as="p" fontSize="t2" className={styles.name}>
              {entry.file.name}
            </Text>
          </VStack>
        </li>
      ))}
    </AttachmentInput.ItemGroup>
  );
}
