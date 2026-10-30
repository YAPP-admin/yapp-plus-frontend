import { revalidateLogic, useForm } from '@tanstack/react-form';
import { Field, Text, TextField, VStack } from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
import type { Member, MemberPart, MemberRole } from '~/features/member-management';
import { FilterSelect } from '~/shared/ui/filter-select';
import { getMemberFormValues, memberFormErrors } from '../model/member-form';
import * as styles from './member-edit-form.css';

const partOptions: readonly MemberPart[] = ['pm', 'design', 'android', 'ios', 'web', 'server'];
const partLabels: Record<MemberPart, string> = {
  pm: 'PM',
  design: '디자인',
  android: 'Android',
  ios: 'iOS',
  web: 'Web',
  server: 'Server',
};
const roleOptions: readonly MemberRole[] = ['admin', 'active-member', 'regular-member'];
const roleLabels: Record<MemberRole, string> = {
  admin: '운영진',
  'active-member': '활동회원',
  'regular-member': '정회원',
};

function FieldError({ errors }: { errors: readonly unknown[] }) {
  return errors.length > 0 ? (
    <Field.ErrorMessage role="alert">{errors.map(String).join(' ')}</Field.ErrorMessage>
  ) : null;
}

export function MemberEditForm({ member, activityId }: { member: Member; activityId: string }) {
  const activity = member.activities.find((item) => item.id === activityId);
  if (activity === undefined) {
    throw new Error(`회원 활동을 찾을 수 없습니다: ${activityId}`);
  }

  const form = useForm({
    defaultValues: getMemberFormValues(member, activityId),
    validationLogic: revalidateLogic({ mode: 'blur', modeAfterSubmission: 'change' }),
    validators: {
      onDynamic: ({ value }) => memberFormErrors(value, { member, activityId }),
    },
    onSubmit: () => undefined,
  });

  return (
    <form
      className={styles.form}
      aria-label="회원 정보 수정"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <fieldset className={styles.fields}>
        <form.Field name="name">
          {(field) => (
            <Field.Root invalid={field.state.meta.errors.length > 0}>
              <Field.Label>이름</Field.Label>
              <TextField.Root value={field.state.value} onValueChange={field.handleChange}>
                <TextField.Input name="name" autoComplete="name" onBlur={field.handleBlur} />
              </TextField.Root>
              <div className={styles.feedback}>
                <FieldError errors={field.state.meta.errors} />
              </div>
            </Field.Root>
          )}
        </form.Field>

        <form.Field name="generation">
          {(field) => (
            <Field.Root invalid={field.state.meta.errors.length > 0}>
              <Field.Label>활동 기수</Field.Label>
              <TextField.Root
                value={String(field.state.value)}
                onValueChange={(value) => field.handleChange(Number(value))}
              >
                <TextField.Input
                  name="generation"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  onBlur={field.handleBlur}
                />
              </TextField.Root>
              <div className={styles.feedback}>
                <FieldError errors={field.state.meta.errors} />
              </div>
            </Field.Root>
          )}
        </form.Field>

        <form.Field name="part">
          {(field) => (
            <FilterSelect
              label="직군"
              value={field.state.value}
              options={partOptions}
              labels={partLabels}
              onChange={field.handleChange}
            />
          )}
        </form.Field>

        <form.Field name="role">
          {(field) => (
            <FilterSelect
              label="권한"
              value={field.state.value}
              options={roleOptions}
              labels={roleLabels}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
      </fieldset>

      <section className={styles.section} aria-labelledby="member-history-title">
        <VStack gap="x2">
          <Text as="h2" id="member-history-title" textStyle="t5Bold">
            변경 이력
          </Text>
          {activity.changes.length > 0 ? (
            activity.changes.map((change) => (
              <div className={styles.historyItem} key={`${change.occurredAt}-${change.field}`}>
                <Text>{`${change.previousValue} → ${change.nextValue}`}</Text>
                <Text className={styles.historyMeta}>
                  {`${change.actorName} · ${new Date(change.occurredAt).toLocaleDateString('ko-KR')}`}
                </Text>
              </div>
            ))
          ) : (
            <Text className={styles.historyMeta}>변경 이력이 없어요.</Text>
          )}
        </VStack>
      </section>

      <VStack gap="x3">
        <Text className={styles.notice} role="note">
          저장과 비활동 처리는 기능 준비 중이에요.
        </Text>
        <div className={styles.actions}>
          <ActionButton type="button" disabled aria-label="저장 (준비 중)">
            저장
          </ActionButton>
          <ActionButton
            type="button"
            variant="neutralWeak"
            disabled
            aria-label="비활동 처리 (준비 중)"
          >
            비활동 처리
          </ActionButton>
        </div>
      </VStack>
    </form>
  );
}
