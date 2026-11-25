/** 생성 SDK의 Markdown·presigned upload 계약으로 공지 작성·수정을 연결한다. */
import { useId, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { Text, type AttachmentInputFileEntry } from '@seed-design/react';
import { useRouter } from '@tanstack/react-router';
import type { AdminPostDetailResponse } from '@yapp-plus/api/generated';
import { ApiError } from '@yapp-plus/api';
import { Snackbar, useSnackbarAdapter } from '@yapp-plus/ui';
import { useAdminGeneration } from '~/features/admin-generation';
import {
  NoticeEditor,
  NoticeAttachmentInput,
  NoticeForm,
  NoticeLeaveDialog,
  emptyNoticeForm,
  useAdminNoticeMutations,
  type NoticeFormValues,
  type NoticeFormContent,
} from '~/features/notice-management';
import * as styles from './notice-editor-page.css';
import { getAudience } from './notice-editor-audience';

type NoticeEditorEntry = AttachmentInputFileEntry & { imageKey?: string };

const jobByApiPosition = {
  PM: 'PM',
  DESIGN: 'Design',
  ANDROID: 'Mobile',
  IOS: 'Mobile',
  MOBILE: 'Mobile',
  WEB: 'Web',
  SERVER: 'Server',
  AI_NATIVE: 'AI Native',
} as const;

function getNoticeType(category: NoticeFormContent['category']) {
  if (category === 'submission') {
    return 'ASSIGNMENT' as const;
  }
  if (category === 'session') {
    return 'SESSION' as const;
  }
  return 'OPERATION' as const;
}

function getAssignment(content: NoticeFormContent) {
  if (content.category !== 'submission') {
    return null;
  }

  const method = content.submission.method;
  const deadlineDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
  }).format(new Date(content.submission.deadlineAt));

  return {
    deadlineDate,
    submissionUrl: method.url.trim(),
    submissionLinkText: method.name.trim(),
  };
}

function getInitialValues(notice?: AdminPostDetailResponse) {
  if (!notice) {
    return emptyNoticeForm;
  }

  const audience =
    notice.audience.type === 'POSITION'
      ? notice.audience.positions.map((position) => jobByApiPosition[position])
      : (
          {
            ALL_USERS: 'all',
            PLAYER: 'active',
            OB: 'regular',
            COMPLETED_MEMBER: 'completed',
          } as const
        )[notice.audience.target ?? 'ALL_USERS'];
  let category: 'session' | 'submission' | 'operation' = 'operation';
  if (notice.type === 'ASSIGNMENT') {
    category = 'submission';
  } else if (notice.type === 'SESSION') {
    category = 'session';
  }

  return {
    title: notice.title,
    category,
    audience,
    submission: {
      deadline: { date: notice.assignment?.deadlineDate ?? '', time: '00:00' },
      method: {
        name: notice.assignment?.submissionLinkText ?? '',
        url: notice.assignment?.submissionUrl ?? '',
      },
    },
  } satisfies typeof emptyNoticeForm;
}

function getInitialEntries(notice?: AdminPostDetailResponse): NoticeEditorEntry[] {
  return (notice?.images ?? []).map((image) => ({
    id: image.imageKey,
    imageKey: image.imageKey,
    file: new File([], image.filename, { type: image.contentType }),
    status: 'success',
  }));
}

function getDraftSnapshot(values: NoticeFormValues, body: string, entries: NoticeEditorEntry[]) {
  return JSON.stringify({
    values,
    body,
    imageKeys: entries.map((entry) => entry.imageKey ?? entry.id),
  });
}

async function getSha256Base64(file: File) {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  const bytes = new Uint8Array(digest);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/** 파일별 presign과 S3 PUT을 최대 5개까지 병렬 처리한다. */
async function uploadImages(
  entries: NoticeEditorEntry[],
  generationId: number,
  presign: ReturnType<typeof useAdminNoticeMutations>['presign'],
  setEntries: Dispatch<SetStateAction<NoticeEditorEntry[]>>,
) {
  const keys = Array.from<string | undefined>({ length: entries.length });
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < entries.length) {
      const index = nextIndex++;
      const entry = entries[index];
      if (!entry) {
        continue;
      }

      if (entry.imageKey) {
        keys[index] = entry.imageKey;
        continue;
      }

      const result = await getSha256Base64(entry.file).then((checksumSha256) =>
        presign.mutateAsync({
          path: { generationId },
          body: {
            filename: entry.file.name,
            contentType: entry.file.type,
            sizeBytes: entry.file.size,
            checksumSha256,
          },
        }),
      );
      const upload = await fetch(result.uploadUrl, {
        method: 'PUT',
        headers: result.signedHeaders,
        body: entry.file,
      });
      if (!upload.ok) {
        throw new Error(`이미지 업로드 실패 (${upload.status})`);
      }

      keys[index] = result.imageKey;
      setEntries((current) =>
        current.map((currentEntry) =>
          currentEntry.id === entry.id
            ? { ...currentEntry, imageKey: result.imageKey, status: 'success' }
            : currentEntry,
        ),
      );
    }
  }

  await Promise.all(Array.from({ length: Math.min(5, entries.length) }, () => worker()));
  return keys.filter((key): key is string => Boolean(key));
}

/** 메타데이터·Markdown·첨부를 SDK 요청으로 조합한다. */
export function NoticeEditorForm({ notice }: { notice?: AdminPostDetailResponse }) {
  const bodyId = useId();
  const router = useRouter();
  const snackbar = useSnackbarAdapter();
  const { currentGeneration } = useAdminGeneration();
  const { create, update, presign } = useAdminNoticeMutations(currentGeneration.generationId);
  const [body, setBody] = useState(notice?.contentMarkdown ?? '');
  const [bodyError, setBodyError] = useState(false);
  const [entries, setEntries] = useState<NoticeEditorEntry[]>(() => getInitialEntries(notice));
  const [saveError, setSaveError] = useState<string>();
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const initialValues = useMemo(() => getInitialValues(notice), [notice]);
  const initialBody = notice?.contentMarkdown ?? '';
  const initialEntries = useMemo(() => getInitialEntries(notice), [notice]);
  const initialSnapshot = useMemo(
    () => getDraftSnapshot(initialValues, initialBody, initialEntries),
    [initialBody, initialEntries, initialValues],
  );
  const pending = create.isPending || update.isPending || presign.isPending;
  const checkingImages = entries.some(({ status }) => status === 'pending');

  async function save(content: NoticeFormContent) {
    setSaveError(undefined);
    const hasBody = body.trim().length > 0;
    setBodyError(!hasBody);
    if (!hasBody || checkingImages || pending) {
      return;
    }

    try {
      const imageKeys = await uploadImages(
        entries,
        currentGeneration.generationId,
        presign,
        setEntries,
      );
      const requestBody = {
        type: getNoticeType(content.category),
        audience: getAudience(content),
        title: content.title.trim(),
        contentMarkdown: body,
        imageKeys,
        assignment: getAssignment(content),
      };

      if (notice) {
        await update.mutateAsync({
          path: { generationId: currentGeneration.generationId, postId: notice.postId },
          body: {
            title: requestBody.title,
            contentMarkdown: requestBody.contentMarkdown,
            imageKeys,
          },
        });
      } else {
        await create.mutateAsync({
          path: { generationId: currentGeneration.generationId },
          headers: { 'Idempotency-Key': idempotencyKey },
          body: requestBody,
        });
      }

      router.history.back();
    } catch (error) {
      if (error instanceof ApiError && error.status === 404 && notice) {
        snackbar.create({
          render: () => <Snackbar variant="critical" message="존재하지 않는 공지입니다." />,
        });
        void router.navigate({ to: '/notices', search: {} });
        return;
      }

      const message =
        error instanceof ApiError && error.status === 409
          ? '다른 관리자가 먼저 수정했습니다. 최신 내용을 확인한 뒤 다시 시도해 주세요.'
          : '저장하지 못했습니다. 입력을 유지했으니 다시 시도해 주세요.';
      setSaveError(message);
      snackbar.create({ render: () => <Snackbar variant="critical" message={message} /> });
    }
  }

  return (
    <NoticeForm
      initialValues={initialValues}
      onSubmit={save}
      isPending={pending}
      error={saveError}
      submitLabel={notice ? '수정 저장' : '공지 등록'}
      submitDisabled={checkingImages || pending}
      renderFooter={(values) => (
        <NoticeLeaveDialog
          dirty={
            !create.isSuccess &&
            !update.isSuccess &&
            getDraftSnapshot(values, body, entries) !== initialSnapshot
          }
        />
      )}
    >
      <section aria-labelledby={bodyId} inert={pending}>
        <h2 id={bodyId} className={styles.description}>
          공지 내용
        </h2>
        <NoticeEditor
          labelId={bodyId}
          initialMarkdown={notice?.contentMarkdown}
          errorId={bodyError ? `${bodyId}-error` : undefined}
          onMarkdownChange={(value) => {
            setBody(value);
            if (bodyError) {
              setBodyError(value.trim().length === 0);
            }
          }}
        />
        {bodyError && (
          <Text as="p" id={`${bodyId}-error`} role="alert" color="fg.critical">
            공지 내용을 입력하세요.
          </Text>
        )}
      </section>

      <NoticeAttachmentInput
        entries={entries}
        onEntriesChange={(next) => setEntries(next)}
        disabled={pending}
      />
    </NoticeForm>
  );
}
