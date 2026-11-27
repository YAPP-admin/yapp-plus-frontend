import { useEffect, useMemo, useState } from 'react';
import { Dialog, Field, Portal, Select, TextField } from '@seed-design/react';
import { useNavigate } from '@tanstack/react-router';
import { ActionButton, Snackbar, useSnackbarAdapter } from '@yapp-plus/ui';
import { ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAdminGeneration } from '~/features/admin-generation';
import { SessionScheduleField } from '~/pages/sessions/ui/session-schedule-field';
import {
  diningPreviewQueryOptions,
  getAfterpartyApiErrorMessage,
  normalizeDiningRoles,
  useDiningCreateMutation,
  type DiningRole,
} from '../model/dining-api';
import * as styles from './dining-create-page.css';

type FormField = 'title' | 'content' | 'startsAt' | 'deadline' | 'generation' | 'roles';

const invitationOptions: readonly { value: DiningRole; label: string }[] = [
  { value: 'STAFF', label: '운영진' },
  { value: 'PLAYER', label: '활동회원' },
];

const weekdayFormatter = new Intl.DateTimeFormat('ko-KR', {
  weekday: 'short',
  timeZone: 'Asia/Seoul',
});

export function DiningCreatePage() {
  const navigate = useNavigate();
  const snackbar = useSnackbarAdapter();
  const { generations, currentGeneration } = useAdminGeneration();
  const createMutation = useDiningCreateMutation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [startsDate, setStartsDate] = useState('');
  const [startsTime, setStartsTime] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [selectedGenerationId, setSelectedGenerationId] = useState<number | undefined>();
  const [generationTouched, setGenerationTouched] = useState(false);
  const [roles, setRoles] = useState<DiningRole[]>(['STAFF', 'PLAYER']);
  const [touched, setTouched] = useState<Partial<Record<FormField, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);

  const generationOptions = useMemo(
    () => generations.toSorted((a, b) => b.generationNumber - a.generationNumber),
    [generations],
  );

  const generationId = generationTouched ? selectedGenerationId : currentGeneration?.generationId;

  const normalizedRoles = normalizeDiningRoles(roles);
  const previewQuery = useQuery({
    ...diningPreviewQueryOptions(generationId ?? 0, roles),
    enabled: generationId !== undefined && normalizedRoles.length > 0,
  });
  const recipientCount = previewQuery.data?.recipientCount ?? 0;
  const previewLoading = previewQuery.isPending || previewQuery.isFetching;

  const errors = validateForm({
    title,
    content,
    startsDate,
    startsTime,
    deadlineDate,
    deadlineTime,
    generationId,
    roles,
  });
  const isDirty =
    title !== '' ||
    content !== '' ||
    startsDate !== '' ||
    startsTime !== '' ||
    deadlineDate !== '' ||
    deadlineTime !== '' ||
    generationTouched ||
    roles.length !== 2;
  const showError = (field: FormField) => touched[field] === true || submitAttempted;
  const canCreate =
    Object.values(errors).every((value) => value === undefined) &&
    generationId !== undefined &&
    normalizedRoles.length > 0 &&
    !previewLoading &&
    !previewQuery.error &&
    recipientCount > 0 &&
    !createMutation.isPending;

  useEffect(() => {
    const shouldWarn = isDirty || previewLoading || createMutation.isPending;
    if (!shouldWarn) {
      return undefined;
    }
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [createMutation.isPending, isDirty, previewLoading]);

  function markTouched(field: FormField) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function toggleRole(role: DiningRole) {
    markTouched('roles');
    setRoles((current) =>
      current.includes(role) ? current.filter((item) => item !== role) : [...current, role],
    );
  }

  function leaveCreatePage() {
    if (isDirty || previewLoading || createMutation.isPending) {
      setExitDialogOpen(true);
      return;
    }
    void navigate({ to: '/dining', search: {} });
  }

  function confirmLeave() {
    setExitDialogOpen(false);
    void navigate({ to: '/dining', search: {} });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    if (!canCreate || generationId === undefined) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        path: { generationId },
        body: {
          title: title.trim(),
          content: content.trim(),
          startsAt: toKstIso(startsDate, startsTime),
          deadline: toKstIso(deadlineDate, deadlineTime),
          invitationRoles: normalizedRoles,
        },
      });
      await createMutation.invalidateList(generationId);
      snackbar.create({
        render: () => <Snackbar variant="positive" message="뒤풀이가 생성되었어요." />,
      });
      void navigate({ to: '/dining', search: {} });
    } catch (error) {
      snackbar.create({
        render: () => (
          <Snackbar variant="critical" message={getAfterpartyApiErrorMessage(error, 'create')} />
        ),
      });
    }
  }

  return (
    <>
      <main className={styles.page}>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>DINNER</p>
          <h1 className={styles.title}>뒤풀이 만들기</h1>
          <p className={styles.description}>저장하면 초대 범위의 회원 앱에 바로 노출돼요.</p>
        </header>

        <form className={styles.form} aria-label="뒤풀이 만들기" onSubmit={handleSubmit}>
          <fieldset className={styles.fields} disabled={createMutation.isPending}>
            <Field.Root invalid={showError('title') && errors.title !== undefined}>
              <Field.Label>제목</Field.Label>
              <TextField.Root value={title} onValueChange={setTitle}>
                <TextField.Input
                  name="title"
                  required
                  onChange={() => markTouched('title')}
                  onBlur={() => markTouched('title')}
                />
              </TextField.Root>
              {showError('title') && errors.title ? (
                <Field.ErrorMessage role="alert">{errors.title}</Field.ErrorMessage>
              ) : null}
            </Field.Root>

            <Field.Root invalid={showError('content') && errors.content !== undefined}>
              <Field.Label>소개 글</Field.Label>
              <TextField.Root value={content} onValueChange={setContent}>
                <TextField.Textarea
                  name="content"
                  required
                  className={styles.introductionTextarea}
                  onChange={() => markTouched('content')}
                  onBlur={() => markTouched('content')}
                />
              </TextField.Root>
              {showError('content') && errors.content ? (
                <Field.ErrorMessage role="alert">{errors.content}</Field.ErrorMessage>
              ) : null}
            </Field.Root>

            <div className={styles.schedule}>
              <Field.Root invalid={showError('startsAt') && errors.startsAt !== undefined}>
                <Field.Label className={styles.fieldLabel}>
                  뒤풀이 날짜 <span className={styles.required}>*</span>
                </Field.Label>
                <div className={styles.dateTimeFields}>
                  <SessionScheduleField
                    type="date"
                    label="뒤풀이 날짜"
                    value={startsDate}
                    displayValue={formatDateValue(startsDate)}
                    labelClassName={styles.visuallyHidden}
                    disabled={createMutation.isPending}
                    error={showError('startsAt') ? errors.startsAt : undefined}
                    onChange={(value) => {
                      markTouched('startsAt');
                      setStartsDate(value);
                    }}
                    onBlur={() => markTouched('startsAt')}
                  />
                  <SessionScheduleField
                    type="time"
                    label="뒤풀이 시간"
                    value={startsTime}
                    labelClassName={styles.visuallyHidden}
                    disabled={createMutation.isPending}
                    error={showError('startsAt') ? errors.startsAt : undefined}
                    onChange={(value) => {
                      markTouched('startsAt');
                      setStartsTime(value);
                    }}
                    onBlur={() => markTouched('startsAt')}
                  />
                </div>
                {showError('startsAt') && errors.startsAt ? (
                  <Field.ErrorMessage role="alert">{errors.startsAt}</Field.ErrorMessage>
                ) : null}
              </Field.Root>

              <Field.Root invalid={showError('deadline') && errors.deadline !== undefined}>
                <Field.Label className={styles.fieldLabel}>
                  조사 기한 <span className={styles.required}>*</span>
                </Field.Label>
                <div className={styles.dateTimeFields}>
                  <SessionScheduleField
                    type="date"
                    label="조사 기한"
                    value={deadlineDate}
                    displayValue={formatDateValue(deadlineDate)}
                    labelClassName={styles.visuallyHidden}
                    disabled={createMutation.isPending}
                    error={showError('deadline') ? errors.deadline : undefined}
                    onChange={(value) => {
                      markTouched('deadline');
                      setDeadlineDate(value);
                    }}
                    onBlur={() => markTouched('deadline')}
                  />
                  <SessionScheduleField
                    type="time"
                    label="조사 기한 시간"
                    value={deadlineTime}
                    labelClassName={styles.visuallyHidden}
                    disabled={createMutation.isPending}
                    error={showError('deadline') ? errors.deadline : undefined}
                    onChange={(value) => {
                      markTouched('deadline');
                      setDeadlineTime(value);
                    }}
                    onBlur={() => markTouched('deadline')}
                  />
                </div>
                {showError('deadline') && errors.deadline ? (
                  <Field.ErrorMessage role="alert">{errors.deadline}</Field.ErrorMessage>
                ) : null}
              </Field.Root>
            </div>

            <Field.Root invalid={showError('roles') && errors.roles !== undefined}>
              <Field.Label className={styles.fieldLabel}>
                초대 범위 <span className={styles.required}>*</span>
              </Field.Label>
              <fieldset className={styles.inviteOptions}>
                <legend className={styles.inviteLegend}>초대 범위</legend>
                {invitationOptions.map(({ value, label }) => {
                  const selected = roles.includes(value);
                  return (
                    <button
                      key={value}
                      className={`${styles.inviteOption} ${selected ? styles.inviteOptionSelected : ''}`}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleRole(value)}
                    >
                      {selected && <span className={styles.inviteOptionCheck}>✓</span>}
                      {label}
                    </button>
                  );
                })}
                <span className={styles.inviteCategory}>기수</span>
                <Select.Root
                  value={generationId === undefined ? [] : [String(generationId)]}
                  disabled={generationOptions.length === 0 || createMutation.isPending}
                  onValueChange={(values) => {
                    const next = Number(values[0]);
                    if (!Number.isInteger(next)) {
                      return;
                    }
                    markTouched('generation');
                    setGenerationTouched(true);
                    setSelectedGenerationId(next);
                  }}
                >
                  <Select.Trigger className={styles.generationSelect} aria-label="기수 선택">
                    <Select.Value>
                      {formatGenerationLabel(
                        generationOptions.find((option) => option.generationId === generationId)
                          ?.generationNumber,
                      )}
                    </Select.Value>
                    <Select.SuffixIcon svg={<ChevronDown aria-hidden="true" size={16} />} />
                  </Select.Trigger>
                  <Select.Positioner>
                    <Select.Content data-seed-color-mode="dark-only">
                      <Select.Group>
                        {generationOptions.map((option) => (
                          <Select.Item
                            key={option.generationId}
                            value={String(option.generationId)}
                            label={formatGenerationLabel(option.generationNumber)}
                          >
                            <Select.ItemBody>
                              <Select.ItemLabel />
                            </Select.ItemBody>
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Content>
                  </Select.Positioner>
                  <Select.HiddenSelect />
                </Select.Root>
              </fieldset>
              {showError('roles') && errors.roles ? (
                <Field.ErrorMessage role="alert">{errors.roles}</Field.ErrorMessage>
              ) : null}
              {generationOptions.length === 0 ? (
                <p className={styles.previewError} role="alert">
                  기수 정보를 불러오지 못했어요. 다시 시도해 주세요.
                </p>
              ) : null}
              <p className={styles.inviteDescription}>
                선택한 범위의 회원 앱에 뒤풀이 카드와 미응답 표시가 떠요 · 대상{' '}
                {previewLoading ? '확인 중' : recipientCount}명
              </p>
            </Field.Root>

            {previewQuery.error ? (
              <p className={styles.previewError} role="alert">
                {getAfterpartyApiErrorMessage(previewQuery.error, 'preview')}
              </p>
            ) : null}
            {!previewLoading && normalizedRoles.length > 0 && recipientCount === 0 ? (
              <p className={styles.previewError} role="alert">
                초대할 대상이 없어 뒤풀이를 만들 수 없어요.
              </p>
            ) : null}
          </fieldset>

          <footer className={styles.actions}>
            <ActionButton type="button" variant="neutralWeak" onClick={leaveCreatePage}>
              취소
            </ActionButton>
            <ActionButton
              type="submit"
              variant="brandSolid"
              className={styles.primaryButton}
              disabled={!canCreate}
              loading={createMutation.isPending}
            >
              뒤풀이 만들기
            </ActionButton>
          </footer>
        </form>
      </main>
      <Dialog.Root open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>작성 중인 내용이 있어요</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <p>페이지를 나가면 입력한 내용과 진행 중인 요청이 사라져요.</p>
              </Dialog.Body>
              <Dialog.Footer className={styles.actions}>
                <ActionButton
                  type="button"
                  variant="neutralWeak"
                  onClick={() => setExitDialogOpen(false)}
                >
                  계속 작성
                </ActionButton>
                <ActionButton type="button" variant="brandSolid" onClick={confirmLeave}>
                  나가기
                </ActionButton>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}

function validateForm({
  title,
  content,
  startsDate,
  startsTime,
  deadlineDate,
  deadlineTime,
  generationId,
  roles,
}: {
  title: string;
  content: string;
  startsDate: string;
  startsTime: string;
  deadlineDate: string;
  deadlineTime: string;
  generationId: number | undefined;
  roles: readonly DiningRole[];
}) {
  const errors: Partial<Record<FormField, string>> = {};
  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();

  if (trimmedTitle.length === 0) {
    errors.title = '제목을 입력해 주세요.';
  } else if (Array.from(trimmedTitle).length > 50) {
    errors.title = '제목은 50자 이내로 입력해 주세요.';
  }
  if (trimmedContent.length === 0) {
    errors.content = '소개 글을 입력해 주세요.';
  } else if (Array.from(trimmedContent).length > 2000) {
    errors.content = '소개 글은 2,000자 이내로 입력해 주세요.';
  }

  const startsAt = toDate(startsDate, startsTime);
  const deadline = toDate(deadlineDate, deadlineTime);
  if (startsAt === undefined) {
    errors.startsAt = '뒤풀이 날짜와 시간을 선택해 주세요.';
  } else if (startsAt.getTime() <= Date.now()) {
    errors.startsAt = '미래 시각을 선택해 주세요.';
  }
  if (deadline === undefined) {
    errors.deadline = '조사 기한 날짜와 시간을 선택해 주세요.';
  } else if (deadline.getTime() <= Date.now()) {
    errors.deadline = '미래 시각을 선택해 주세요.';
  } else if (startsAt !== undefined && deadline.getTime() >= startsAt.getTime()) {
    errors.deadline = '조사 기한은 뒤풀이 시작 전이어야 해요.';
  }
  if (generationId === undefined) {
    errors.generation = '기수를 선택해 주세요.';
  }
  if (roles.length === 0) {
    errors.roles = '초대 범위를 하나 이상 선택해 주세요.';
  }
  return errors;
}

function toDate(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return undefined;
  }
  const value = new Date(`${date}T${time}:00+09:00`);
  return Number.isNaN(value.getTime()) ? undefined : value;
}

function toKstIso(date: string, time: string) {
  return `${date}T${time}:00+09:00`;
}

function formatGenerationLabel(generationNumber: number | undefined) {
  return generationNumber === undefined ? '기수를 선택해 주세요' : `${generationNumber}기`;
}

function formatDateValue(value: string) {
  if (!value) {
    return '';
  }
  const date = new Date(`${value}T00:00:00+09:00`);
  return `${value.replaceAll('-', '.')} (${weekdayFormatter.format(date)})`;
}
