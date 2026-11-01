import { useState } from 'react';
import type { ComponentProps } from 'react';
import type { AttachmentInput } from '@seed-design/react';
import { useImportFile } from './use-import-file';

type AttachmentInputProps = ComponentProps<typeof AttachmentInput.Root>;
type FileEntry = NonNullable<AttachmentInputProps['acceptedFileEntries']>[number];
type FileRejection = Parameters<NonNullable<AttachmentInputProps['onFileReject']>>[0][number];

const fileRejectionMessages: Record<string, string> = {
  INVALID_TYPE: 'CSV 파일만 선택할 수 있어요.',
  FILE_TOO_LARGE: '파일 크기는 10MB 이하만 업로드할 수 있어요.',
  TOO_MANY_FILES: 'CSV 파일은 한 번에 하나만 선택할 수 있어요.',
};

/** 파일 입력 상태와 로컬 CSV 파싱 mutation을 업로드 화면의 단일 상태로 조합한다. */
export function useMemberImportUpload() {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const importFile = useImportFile();

  const selectedFile = entries.at(0)?.file ?? null;
  const errorMessage = fileError ?? importFile.error?.message;

  function reset() {
    setEntries([]);
    setFileError(null);
    importFile.reset();
  }

  function rejectFiles(rejections: FileRejection[]) {
    reset();
    setFileError(
      rejections
        .flatMap(({ errors }) => errors)
        .map((error) => fileRejectionMessages[error] ?? '파일을 읽을 수 없어요.')
        .join(' '),
    );
  }

  function acceptFiles(acceptedEntries: FileEntry[]) {
    const file = acceptedEntries.at(0)?.file;
    if (file === undefined) {
      return;
    }

    setEntries(acceptedEntries);
    setFileError(null);
    importFile.selectFile(file);
  }

  return {
    entries,
    selectedFile,
    errorMessage,
    result: importFile.data,
    isPending: importFile.isPending,
    acceptFiles,
    rejectFiles,
    setEntries,
    reset,
  };
}

export type MemberImportUploadState = ReturnType<typeof useMemberImportUpload>;
