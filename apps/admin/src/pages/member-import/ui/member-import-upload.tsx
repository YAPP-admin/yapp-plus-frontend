import { useId } from 'react';
import { AttachmentInput, Field, Text, VStack } from '@seed-design/react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { MAX_IMPORT_FILE_BYTES } from '../model/import-file';
import type { MemberImportUploadState } from '../model/use-member-import-upload';
import {
  dropzone,
  dropzoneDescription,
  fileName,
  sectionTitle,
  statusError,
  triggerContainer,
} from './member-import-page.css';

const importFileOptions = {
  accept: '.csv',
  maxFiles: 1,
  maxFileSize: MAX_IMPORT_FILE_BYTES,
};

type MemberImportUploadProps = Pick<
  MemberImportUploadState,
  | 'entries'
  | 'selectedFile'
  | 'errorMessage'
  | 'isPending'
  | 'acceptFiles'
  | 'rejectFiles'
  | 'setEntries'
>;

export function MemberImportUpload({
  entries,
  selectedFile,
  errorMessage,
  isPending,
  acceptFiles,
  rejectFiles,
  setEntries,
}: MemberImportUploadProps) {
  const inputId = useId();

  return (
    <>
      <VStack gap="x1_5">
        <Text as="h2" id="member-import-upload-heading" className={sectionTitle}>
          CSV 파일 선택
        </Text>
        <Text as="p" className={dropzoneDescription}>
          UTF-8 CSV, 최대 10MB · 이름·전화번호·기수·직군·권한 열을 사용해요.
        </Text>
      </VStack>

      <Field.Root invalid={errorMessage !== undefined}>
        <Field.Label asChild>
          <label htmlFor={inputId}>회원 명단 파일</label>
        </Field.Label>
        <AttachmentInput.Root
          {...importFileOptions}
          acceptedFileEntries={entries}
          onAcceptedFileEntriesChange={setEntries}
          onFileAccept={acceptFiles}
          onFileReject={rejectFiles}
          invalid={errorMessage !== undefined}
          disabled={isPending}
        >
          <AttachmentInput.HiddenInput id={inputId} />
          <AttachmentInput.Dropzone className={dropzone}>
            <FileSpreadsheet size={32} aria-hidden="true" />
            <AttachmentInput.DropzoneLabel>
              CSV 파일을 여기에 놓거나 파일을 선택하세요.
            </AttachmentInput.DropzoneLabel>
            <Text as="p" className={dropzoneDescription}>
              전화번호는 010-1234-5678 또는 01012345678 형식을 지원해요.
            </Text>
          </AttachmentInput.Dropzone>
          <AttachmentInput.Container className={triggerContainer}>
            <AttachmentInput.Trigger aria-label="CSV 파일 선택">
              <Upload size={18} aria-hidden="true" />
              파일 선택
            </AttachmentInput.Trigger>
          </AttachmentInput.Container>
        </AttachmentInput.Root>
        {selectedFile !== null && (
          <Text as="p" className={fileName}>
            선택한 파일: {selectedFile.name}
          </Text>
        )}
        {isPending && <output>CSV 파일을 읽고 있어요.</output>}
        {errorMessage !== undefined && (
          <Field.ErrorMessage role="alert" className={statusError}>
            {errorMessage}
          </Field.ErrorMessage>
        )}
      </Field.Root>
    </>
  );
}
