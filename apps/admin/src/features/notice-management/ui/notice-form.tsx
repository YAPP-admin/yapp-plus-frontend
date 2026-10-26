/** 작성·수정에서 공유하는 공지 메타데이터 입력과 조건부 제출 항목이다. */
import { useId, useRef, useState, type ReactNode, type Ref } from 'react';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import { Checkbox, Field, RadioGroup, RadioGroupField, TextField, Text } from '@seed-design/react';
import { Check } from 'lucide-react';
import { ActionButton } from '@yapp-plus/ui';
import { noticeJobSchema } from '../model/notice';
import {
  emptyNoticeForm,
  emptySubmission,
  noticeFormSchema,
  validateNoticeForm,
  type NoticeFormValues,
  type NoticeFormContent,
} from '../model/notice-form';
import * as styles from './notice-form.css';

const categories = [
  { value: 'session', label: '세션' },
  { value: 'operation', label: '운영' },
  { value: 'submission', label: '제출' },
] as const;
const audiences = [
  { value: 'all', label: '전체 사용자' },
  { value: 'active', label: '활동회원' },
  { value: 'regular', label: '정회원' },
  { value: 'completed', label: '수료회원' },
] as const;
const submissionFields = [
  { name: 'submission.deadline.date', label: '마감 날짜 (한국 시간)', type: 'date' },
  { name: 'submission.deadline.time', label: '마감 시각 (한국 시간)', type: 'time' },
  { name: 'submission.method.name', label: '제출 방법 이름 (선택)', type: 'text' },
  { name: 'submission.method.url', label: '제출 주소 (선택)', type: 'text' },
] as const;

type FocusField = 'title' | 'audience' | (typeof submissionFields)[number]['name'];

type Props = {
  initialValues?: NoticeFormValues;
  children?: ReactNode;
  onSubmit?: (content: NoticeFormContent) => void | Promise<void>;
};

/** 제출 동작이 연결되면 검증하고, 이후 입력 변경 시 오류를 갱신한다. */
export function NoticeForm({ initialValues = emptyNoticeForm, onSubmit, children }: Props) {
  const id = useId();
  const inputs = useRef<Partial<Record<FocusField, HTMLInputElement | null>>>({});
  const [submitError, setSubmitError] = useState('');
  const form = useForm({
    defaultValues: initialValues,
    validationLogic: revalidateLogic({ mode: 'submit', modeAfterSubmission: 'change' }),
    validators: { onDynamic: ({ value }) => validateNoticeForm(value) },
    onSubmitInvalid: ({ formApi }) => {
      const fields = ['title', 'audience', ...submissionFields.map(({ name }) => name)] as const;
      const first = fields.find((name) => formApi.getFieldMeta(name)?.errors.length);
      // 제출 중 비활성화가 해제된 다음 프레임에 오류 입력으로 이동한다.
      requestAnimationFrame(() => {
        if (first) {
          inputs.current[first]?.focus();
        }
      });
    },
    onSubmit: async ({ value }) => {
      try {
        await onSubmit?.(noticeFormSchema.parse(value));
      } catch {
        setSubmitError('처리하지 못했습니다. 입력을 유지했으니 다시 시도하세요.');
      }
    },
  });

  /** 제출 종류 경계를 넘으면 대상·마감·방법을 함께 초기화한다. */
  function changeCategory(category: NoticeFormValues['category']) {
    const previous = form.getFieldValue('category');
    if ((previous === 'submission') !== (category === 'submission')) {
      form.setFieldValue('audience', 'all');
      form.setFieldValue('submission', emptySubmission());
    }
    form.setFieldValue('category', category);
  }

  return (
    <form
      className={styles.form}
      aria-label="공지 입력"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!onSubmit || form.state.isSubmitting) {
          return;
        }
        setSubmitError('');
        void form.handleSubmit();
      }}
    >
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(pending) => (
          <fieldset disabled={pending} className={styles.group}>
            <div className={styles.form}>
              <form.Field name="title">
                {(field) => (
                  <NoticeTextInput
                    disabled={pending}
                    inputRef={(input) => {
                      inputs.current.title = input;
                    }}
                    name="title"
                    label="제목"
                    value={field.state.value}
                    errors={field.state.meta.errors}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>

              <form.Field name="category">
                {(field) => (
                  <NoticeRadioField
                    label="공지 종류"
                    name={`${id}-category`}
                    value={field.state.value}
                    options={categories}
                    disabled={pending}
                    onChange={changeCategory}
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>

              <form.Subscribe selector={(state) => state.values.category}>
                {(category) => (
                  <>
                    <form.Field name="audience">
                      {(field) =>
                        category === 'submission' ? (
                          <Field.Root
                            invalid={field.state.meta.errors.length > 0}
                            disabled={pending}
                          >
                            <Field.Label asChild>
                              <span id={`${id}-audience-label`}>제출 대상 (활동회원)</span>
                            </Field.Label>
                            <Checkbox.Group
                              className={styles.choices}
                              aria-labelledby={`${id}-audience-label`}
                            >
                              <NoticeCheckbox
                                inputRef={(input) => {
                                  inputs.current.audience = input;
                                }}
                                label="활동회원 전체"
                                checked={field.state.value === 'all'}
                                disabled={pending}
                                invalid={field.state.meta.errors.length > 0}
                                errorId={
                                  field.state.meta.errors.length
                                    ? `${id}-audience-error`
                                    : undefined
                                }
                                onBlur={field.handleBlur}
                                onChange={(checked) => field.handleChange(checked ? 'all' : [])}
                              />
                              {noticeJobSchema.options.map((job) => (
                                <NoticeCheckbox
                                  key={job}
                                  label={job}
                                  checked={
                                    Array.isArray(field.state.value) &&
                                    field.state.value.includes(job)
                                  }
                                  disabled={pending}
                                  onBlur={field.handleBlur}
                                  onChange={(checked) => {
                                    const jobs = Array.isArray(field.state.value)
                                      ? field.state.value
                                      : [];
                                    field.handleChange(
                                      checked
                                        ? [...jobs, job]
                                        : jobs.filter((value) => value !== job),
                                    );
                                  }}
                                />
                              ))}
                            </Checkbox.Group>
                            <FieldErrors
                              id={`${id}-audience-error`}
                              errors={field.state.meta.errors}
                            />
                          </Field.Root>
                        ) : (
                          <NoticeRadioField
                            label="공지 대상"
                            name={`${id}-audience`}
                            value={
                              typeof field.state.value === 'string' ? field.state.value : 'all'
                            }
                            options={audiences}
                            disabled={pending}
                            onChange={field.handleChange}
                            onBlur={field.handleBlur}
                          />
                        )
                      }
                    </form.Field>

                    {category === 'submission' && (
                      <fieldset className={styles.group}>
                        <Text as="legend" textStyle="t5Bold">
                          제출 정보
                        </Text>
                        <div className={styles.form}>
                          {submissionFields.map(({ name, label, type }) => (
                            <form.Field key={name} name={name}>
                              {(field) => (
                                <NoticeTextInput
                                  disabled={pending}
                                  inputRef={(input) => {
                                    inputs.current[name] = input;
                                  }}
                                  name={name}
                                  label={label}
                                  type={type}
                                  value={field.state.value}
                                  errors={field.state.meta.errors}
                                  onChange={field.handleChange}
                                  onBlur={field.handleBlur}
                                />
                              )}
                            </form.Field>
                          ))}
                        </div>
                      </fieldset>
                    )}
                  </>
                )}
              </form.Subscribe>
            </div>
          </fieldset>
        )}
      </form.Subscribe>

      {children}

      {onSubmit && (
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(pending) => (
            <ActionButton type="submit" disabled={pending} loading={pending}>
              입력 확인
            </ActionButton>
          )}
        </form.Subscribe>
      )}

      {submitError && (
        <Text as="p" role="alert" color="fg.critical">
          {submitError}
        </Text>
      )}
    </form>
  );
}

/** 입력과 레이블·오류 설명을 한 묶음으로 연결한다. */
function NoticeTextInput({
  inputRef,
  name,
  label,
  type = 'text',
  value,
  errors,
  onChange,
  onBlur,
  disabled,
}: {
  inputRef: Ref<HTMLInputElement>;
  name: string;
  label: string;
  type?: string;
  disabled: boolean;
  value: string;
  errors: (string | undefined)[];
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <Field.Root invalid={errors.length > 0} disabled={disabled}>
      <Field.Label>{label}</Field.Label>
      <TextField.Root value={value} onValueChange={onChange}>
        <TextField.Input ref={inputRef} name={name} type={type} onBlur={onBlur} />
      </TextField.Root>
      <FieldErrors errors={errors} />
    </Field.Root>
  );
}

/** SEED가 입력과 오류 설명의 접근성 연결 및 오류 스타일을 관리한다. */
function FieldErrors({ id, errors }: { id?: string; errors: (string | undefined)[] }) {
  return errors.length ? (
    <Field.ErrorMessage id={id} role="alert">
      {errors.join(' ')}
    </Field.ErrorMessage>
  ) : null;
}

/** 공지의 단일 선택 항목을 SEED 라디오 구성으로 연결한다. */
function NoticeRadioField<T extends string>({
  label,
  name,
  value,
  options,
  disabled,
  onChange,
  onBlur,
}: {
  label: string;
  name: string;
  value: string;
  options: readonly { value: T; label: string }[];
  disabled: boolean;
  onChange: (value: T) => void;
  onBlur: () => void;
}) {
  return (
    <RadioGroupField.Root
      name={name}
      value={value}
      disabled={disabled}
      onValueChange={(nextValue) => {
        const selected = options.find((option) => option.value === nextValue);
        if (selected) {
          onChange(selected.value);
        }
      }}
    >
      <RadioGroupField.Label>{label}</RadioGroupField.Label>
      <RadioGroup.Root className={styles.choices}>
        {options.map((option) => (
          <RadioGroup.Item key={option.value} value={option.value}>
            <RadioGroup.ItemHiddenInput onBlur={onBlur} />
            <RadioGroup.ItemControl>
              <RadioGroup.ItemIndicator />
            </RadioGroup.ItemControl>
            <RadioGroup.ItemLabel>{option.label}</RadioGroup.ItemLabel>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </RadioGroupField.Root>
  );
}

/** 전체·직군 선택에 같은 SEED 체크박스 구조를 사용한다. */
function NoticeCheckbox({
  inputRef,
  label,
  checked,
  disabled,
  invalid,
  errorId,
  onChange,
  onBlur,
}: {
  label: string;
  checked: boolean;
  inputRef?: Ref<HTMLInputElement>;
  disabled: boolean;
  invalid?: boolean;
  errorId?: string;
  onChange: (checked: boolean) => void;
  onBlur: () => void;
}) {
  return (
    <Checkbox.Root
      checked={checked}
      disabled={disabled}
      invalid={invalid}
      onCheckedChange={onChange}
    >
      <Checkbox.HiddenInput ref={inputRef} aria-describedby={errorId} onBlur={onBlur} />
      <Checkbox.Control>
        <Checkbox.Indicator checked={<Check />} />
      </Checkbox.Control>
      <Checkbox.Label>{label}</Checkbox.Label>
    </Checkbox.Root>
  );
}
