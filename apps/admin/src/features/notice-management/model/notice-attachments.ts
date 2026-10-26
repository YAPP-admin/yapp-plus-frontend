/** SEED의 기본 파일 검증에 공지의 묶음 제한과 이미지 읽기 확인을 더한다. */
import type { NoticeAttachment } from './notice';
import type { AttachmentInputRootProps } from '@seed-design/react';
import type { FileEntry, FileRejection } from '@seed-design/react/primitive';

export const MAX_NOTICE_ATTACHMENTS = 5;

const BYTES_PER_MIB = 1024 * 1024;
export const MAX_NOTICE_ATTACHMENT_SIZE = 10 * BYTES_PER_MIB;

/** 형식·크기·추가 버튼 제한은 SEED가 처리한다. */
export const noticeAttachmentOptions = {
  accept: ['image/jpeg', 'image/png', 'image/webp'],
  maxFiles: MAX_NOTICE_ATTACHMENTS,
  maxFileSize: MAX_NOTICE_ATTACHMENT_SIZE,
} satisfies AttachmentInputRootProps;

/** SEED에 파일을 전달하기 전에 초과 묶음 전체를 거절한다. 선택 취소는 오류가 아니다. */
export function getNoticeAttachmentCountError(currentCount: number, selectedCount: number) {
  if (currentCount + selectedCount <= MAX_NOTICE_ATTACHMENTS) {
    return null;
  }

  const remaining = Math.max(0, MAX_NOTICE_ATTACHMENTS - currentCount);

  return `이미지는 최대 ${MAX_NOTICE_ATTACHMENTS}개까지 첨부할 수 있습니다. ${remaining}개 더 선택할 수 있습니다.`;
}

/** SEED의 형식·크기 검증을 통과한 파일만 읽고, 실패한 파일과 정상 파일을 구분한다. */
export async function validateNoticeAttachmentImages(entries: FileEntry[]) {
  const results = await Promise.all(entries.map(canReadImage));
  const accepted: FileEntry[] = [];
  const rejected: FileRejection[] = [];

  for (const [index, entry] of entries.entries()) {
    if (results[index]) {
      accepted.push(entry);
    } else {
      rejected.push({ file: entry.file, errors: ['IMAGE_DECODE_FAILED'] });
    }
  }

  return { accepted, rejected };
}

/** 객체 URL을 만들지 않고 이미지 디코딩을 확인하며 임시 비트맵은 즉시 해제한다. */
async function canReadImage({ file }: FileEntry) {
  try {
    const bitmap = await createImageBitmap(file);
    bitmap.close();

    return true;
  } catch {
    return false;
  }
}

/** 저장 Blob을 SEED가 사용하는 편집용 File 목록으로 변환한다. 원본 배열은 바꾸지 않는다. */
export function getNoticeAttachmentEntries(attachments: NoticeAttachment[]): FileEntry[] {
  return attachments.map(({ id, name, blob }) => ({
    id,
    file: new File([blob], name, { type: blob.type }),
    status: 'success',
  }));
}
