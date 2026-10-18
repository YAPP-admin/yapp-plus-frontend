/** 세션 생성 모달의 여섯 입력과 제출 콜백을 제공하며 저장소 연결은 부모가 담당합니다. */
import { ActionButton, Dialog, Field, Portal, TextField } from '@seed-design/react';
import { useForm } from '@tanstack/react-form';
import { X } from 'lucide-react';
import { useRef, useState, type ReactNode, type Ref } from 'react';
import { FilterSelect } from '~/shared/ui/filter-select';
import { sessionTypeSchema, type CreateSessionInput } from '../model/session';
import { sessionFilterLabels } from '../model/session-search';
import * as styles from './session-create-dialog.css';

const INITIAL_SESSION_VALUES: CreateSessionInput = {
  name: '',
  location: '',
  date: '',
  startTime: '',
  endTime: '',
  type: 'regular',
};

const SESSION_TEXT_FIELDS = [
  { name: 'name', label: '세션명', type: 'text', placeholder: '세션명을 입력해 주세요' },
  { name: 'location', label: '장소', type: 'text', placeholder: '장소를 입력해 주세요' },
  { name: 'date', label: '날짜', type: 'date' },
  { name: 'startTime', label: '시작 시간', type: 'time' },
  { name: 'endTime', label: '종료 시간', type: 'time' },
] as const;

export function SessionCreateDialog({
  trigger,
  onSubmit,
}: {
  trigger: ReactNode;
  onSubmit: (input: CreateSessionInput) => void;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [open, setOpen] = useState(false);
  const form = useForm({
    defaultValues: INITIAL_SESSION_VALUES,
    onSubmit: ({ value }) => onSubmit(value),
  });

  function changeOpen(nextOpen: boolean) {
    if (nextOpen) {
      form.reset();
    }
    setOpen(nextOpen);
  }

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen} closeOnInteractOutside={false}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            className={styles.content}
            data-seed-color-mode="dark-only"
            onFocus={(event) => {
              if (event.target === event.currentTarget) {
                titleRef.current?.focus();
              }
            }}
          >
            <SessionDialogHeader titleRef={titleRef} />
            <form
              className={styles.form}
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                void form.handleSubmit();
              }}
            >
              <div className={styles.fields}>
                {SESSION_TEXT_FIELDS.map(({ name, label, type, ...inputProps }) => (
                  <form.Field key={name} name={name}>
                    {(field) => (
                      <SessionTextInput
                        name={name}
                        label={label}
                        type={type}
                        {...inputProps}
                        value={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                      />
                    )}
                  </form.Field>
                ))}
                <form.Field name="type">
                  {(field) => (
                    <FilterSelect
                      className={styles.fullWidth}
                      label="유형"
                      value={field.state.value}
                      options={sessionTypeSchema.options}
                      labels={sessionFilterLabels}
                      onChange={field.handleChange}
                    />
                  )}
                </form.Field>
              </div>
              <SessionFormActions />
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function SessionDialogHeader({ titleRef }: { titleRef: Ref<HTMLHeadingElement> }) {
  return (
    <Dialog.Header className={styles.header}>
      <Dialog.Title ref={titleRef} tabIndex={-1}>
        세션 만들기
      </Dialog.Title>
      <Dialog.Description>
        세션 일정과 장소를 입력해 주세요. 시간은 한국 시간 기준입니다.
      </Dialog.Description>
      <Dialog.Action asChild>
        <ActionButton
          className={styles.close}
          variant="ghost"
          size="small"
          aria-label="세션 만들기 닫기"
        >
          <X size={24} aria-hidden="true" />
        </ActionButton>
      </Dialog.Action>
    </Dialog.Header>
  );
}

function SessionTextInput({
  name,
  label,
  type,
  placeholder,
  value,
  onChange,
  onBlur,
}: {
  name: (typeof SESSION_TEXT_FIELDS)[number]['name'];
  label: string;
  type: 'text' | 'date' | 'time';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <Field.Root className={type === 'time' ? undefined : styles.fullWidth}>
      <Field.Header>
        <Field.Label>{label}</Field.Label>
      </Field.Header>
      <TextField.Root>
        <TextField.Input
          className={styles.input}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
      </TextField.Root>
    </Field.Root>
  );
}

function SessionFormActions() {
  return (
    <Dialog.Footer className={styles.actions}>
      <Dialog.Action asChild>
        <ActionButton type="button" variant="neutralWeak">
          취소
        </ActionButton>
      </Dialog.Action>
      <ActionButton type="submit" variant="neutralSolid">
        저장
      </ActionButton>
    </Dialog.Footer>
  );
}
