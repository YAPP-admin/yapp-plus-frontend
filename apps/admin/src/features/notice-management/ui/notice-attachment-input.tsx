/** SEED 파일 선택에 공지 전용 묶음 제한과 비동기 이미지 확인을 연결한다. */
import { useId, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AttachmentInput, Field } from '@seed-design/react';
import { useFileUploadContext, type FileRejection } from '@seed-design/react/primitive';
import { ImagePlus } from 'lucide-react';
import type { NoticeAttachment } from '../model/notice';
import {
  getNoticeAttachmentCountError,
  getNoticeAttachmentEntries,
  noticeAttachmentOptions,
  validateNoticeAttachmentImages,
} from '../model/notice-attachments';
import { NoticeAttachmentItems } from './notice-attachment-items';
import * as styles from './notice-attachment-input.css';

const errorLabels: Record<string, string> = {
  INVALID_TYPE: 'JPG·PNG·WebP 이미지만 첨부할 수 있습니다.',
  FILE_TOO_LARGE: '파일 크기는 10MiB 이하여야 합니다.',
  IMAGE_DECODE_FAILED: '이미지를 읽을 수 없습니다.',
};

/** 편집 목록은 저장 원본과 분리하며 재조회 때 초기화하지 않는다. */
export function NoticeAttachmentInput({
  initialAttachments = [],
}: {
  initialAttachments?: NoticeAttachment[];
}) {
  const inputId = useId();
  const [entries, setEntries] = useState(() => getNoticeAttachmentEntries(initialAttachments));
  const [errors, setErrors] = useState<string[]>([]);
  const imageValidation = useMutation({
    mutationFn: validateNoticeAttachmentImages,
    // 로컬 이미지 확인은 네트워크 연결 여부와 무관하게 실행한다.
    networkMode: 'always',
    onSuccess: ({ accepted, rejected }, candidates) => {
      const acceptedIds = new Set(accepted.map(({ id }) => id));
      const candidateIds = new Set(candidates.map(({ id }) => id));

      // 읽기 중 제거된 항목은 다시 추가하지 않고 현재 목록에 남은 후보만 갱신한다.
      setEntries((current) =>
        current
          .filter(({ id }) => !candidateIds.has(id) || acceptedIds.has(id))
          .map((entry) => (acceptedIds.has(entry.id) ? { ...entry, status: 'success' } : entry)),
      );
      rejectFiles(rejected);
    },
  });

  /** 파일별 오류는 정상 파일과 별도로 표시한다. */
  function rejectFiles(rejections: FileRejection[]) {
    setErrors((previous) => [
      ...previous,
      ...rejections.map(
        ({ file, errors: reasons }) =>
          `${file.name}: ${reasons.map((reason) => errorLabels[reason] ?? '첨부할 수 없습니다.').join(' ')}`,
      ),
    ]);
  }

  /** 초과 선택을 SEED가 부분 수락하기 전에 입력 이벤트에서 차단한다. */
  function checkSelection(count: number) {
    const error = getNoticeAttachmentCountError(entries.length, count);

    if (imageValidation.isPending || error || count === 0) {
      if (error) {
        setErrors([error]);
      }
      return false;
    }

    setErrors([]);
    return true;
  }

  return (
    <Field.Root invalid={errors.length > 0}>
      <Field.Label asChild>
        <label htmlFor={inputId}>첨부 이미지</label>
      </Field.Label>
      <Field.Description id={`${inputId}-description`}>
        JPG·PNG·WebP, 파일당 10MiB 이하, 최대 5개
      </Field.Description>

      <AttachmentInput.Root
        {...noticeAttachmentOptions}
        acceptedFileEntries={entries}
        onAcceptedFileEntriesChange={setEntries}
        onFileReject={rejectFiles}
        onFileAccept={(candidates) => imageValidation.mutate(candidates)}
        disabled={imageValidation.isPending}
        invalid={errors.length > 0}
      >
        <NoticeAttachmentFileInput id={inputId} canSelect={checkSelection} />
        <AttachmentInput.Container>
          <AttachmentInput.Trigger
            aria-label="이미지 추가"
            aria-describedby={`${inputId}-description${errors.length > 0 ? ` ${inputId}-errors` : ''}`}
            aria-invalid={errors.length > 0}
          >
            <ImagePlus size={24} aria-hidden="true" />
            <AttachmentInput.TriggerItemCount />
          </AttachmentInput.Trigger>
          <NoticeAttachmentItems entries={entries} />
        </AttachmentInput.Container>
      </AttachmentInput.Root>

      {imageValidation.isPending && <output>이미지를 확인하고 있습니다.</output>}
      {errors.length > 0 && (
        <Field.ErrorMessage asChild>
          <ul id={`${inputId}-errors`} role="alert" className={styles.errors}>
            {errors.map((error, index) => (
              <li key={`${index}-${error}`}>{error}</li>
            ))}
          </ul>
        </Field.ErrorMessage>
      )}
    </Field.Root>
  );
}

/** SEED의 숨김 입력 속성을 사용하되, 묶음 검사 후에만 기본 검증으로 전달한다. */
function NoticeAttachmentFileInput({
  id,
  canSelect,
}: {
  id: string;
  canSelect: (count: number) => boolean;
}) {
  const { hiddenInputProps, inputRef, setFileEntries } = useFileUploadContext();

  return (
    <input
      {...hiddenInputProps}
      id={id}
      ref={inputRef}
      onChange={(event) => {
        const files = Array.from(event.currentTarget.files ?? []);
        event.currentTarget.value = '';

        if (canSelect(files.length)) {
          setFileEntries(files);
        }
      }}
    />
  );
}
