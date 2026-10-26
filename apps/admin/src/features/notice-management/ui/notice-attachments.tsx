/** 저장된 첨부를 SEED의 읽기 전용 미리보기로 표시한다. */
import { AttachmentInput, Text, VStack } from '@seed-design/react';
import type { NoticeAttachment } from '../model/notice';
import { getNoticeAttachmentEntries, noticeAttachmentOptions } from '../model/notice-attachments';
import { NoticeAttachmentItems } from './notice-attachment-items';

/** 조회된 첨부가 바뀌면 최신 파일 목록을 전달한다. */
export function NoticeAttachments({ attachments }: { attachments: NoticeAttachment[] }) {
  const entries = getNoticeAttachmentEntries(attachments);

  if (entries.length === 0) {
    return null;
  }

  return (
    <VStack gap="x2">
      <Text as="h3" fontWeight="bold">
        첨부 이미지
      </Text>
      <AttachmentInput.Root {...noticeAttachmentOptions} acceptedFileEntries={entries} readOnly>
        <AttachmentInput.Container>
          <NoticeAttachmentItems entries={entries} readOnly />
        </AttachmentInput.Container>
      </AttachmentInput.Root>
    </VStack>
  );
}
