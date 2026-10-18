/** 날짜·시간 선택 버튼과 선택 Dialog의 임시 값·확인·취소를 관리합니다. */
import {
  ActionButton,
  DatePicker,
  Dialog,
  FieldButton,
  Portal,
  TimePicker,
} from '@seed-design/react';
import { CalendarDays, Clock } from 'lucide-react';
import { useState } from 'react';
import { createSessionInputSchema } from '../model/session';
import * as styles from './session-schedule-field.css';

type SessionScheduleFieldProps = {
  className?: string;
  name: string;
  label: string;
  type: 'date' | 'time';
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  disabled: boolean;
  error: string;
};

function formatSessionTime(value: string) {
  const hour = Number(value.slice(0, 2));
  return `${hour < 12 ? '오전' : '오후'} ${hour % 12 || 12}:${value.slice(3, 5)}`;
}

export function SessionScheduleField(props: SessionScheduleFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const isDate = props.type === 'date';
  const displayValue = isDate || !props.value ? props.value : formatSessionTime(props.value);
  const changeOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraft(props.value || (isDate ? '' : '00:00'));
    }
    setOpen(nextOpen);
  };

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <FieldButton.Root
        className={props.className}
        values={props.value ? [props.value] : []}
        disabled={props.disabled}
        invalid={Boolean(props.error)}
      >
        <FieldButton.Header>
          <FieldButton.Label>{props.label}</FieldButton.Label>
        </FieldButton.Header>
        <FieldButton.Control>
          <Dialog.Trigger asChild>
            <FieldButton.Button
              name={props.name}
              type="button"
              aria-label={`${props.label} 선택${displayValue ? `, ${displayValue}` : ''}`}
              onBlur={props.onBlur}
            />
          </Dialog.Trigger>
          {props.value ? (
            <FieldButton.Value>{displayValue}</FieldButton.Value>
          ) : (
            <FieldButton.Placeholder>{props.label} 선택</FieldButton.Placeholder>
          )}
          <FieldButton.SuffixIcon svg={isDate ? <CalendarDays /> : <Clock />} />
        </FieldButton.Control>
        {props.error && <FieldButton.ErrorMessage>{props.error}</FieldButton.ErrorMessage>}
      </FieldButton.Root>
      {open && (
        <Portal>
          <Dialog.Positioner>
            <Dialog.Backdrop />
            <Dialog.Content className={styles.pickerDialog} data-seed-color-mode="dark-only">
              <Dialog.Header>
                <Dialog.Title>{props.label} 선택</Dialog.Title>
                {!isDate && (
                  <Dialog.Description>시간을 선택한 뒤 확인을 눌러 주세요.</Dialog.Description>
                )}
              </Dialog.Header>
              <div className={styles.picker}>
                {isDate ? (
                  <SessionDatePicker {...props} value={draft} onChange={setDraft} />
                ) : (
                  <SessionTimePicker {...props} value={draft} onChange={setDraft} />
                )}
              </div>
              <Dialog.Footer className={styles.actions}>
                <Dialog.Action asChild>
                  <ActionButton type="button" variant="neutralWeak">
                    취소
                  </ActionButton>
                </Dialog.Action>
                <ActionButton
                  type="button"
                  disabled={!draft}
                  onClick={() => {
                    props.onChange(draft);
                    setOpen(false);
                  }}
                >
                  확인
                </ActionButton>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      )}
    </Dialog.Root>
  );
}

function SessionDatePicker({ value, onChange, disabled }: SessionScheduleFieldProps) {
  const valid = createSessionInputSchema.shape.date.safeParse(value).success;
  const selected = valid
    ? {
        year: Number(value.slice(0, 4)),
        month: Number(value.slice(5, 7)),
        day: Number(value.slice(8, 10)),
      }
    : undefined;

  return (
    <DatePicker
      yearRange={{ start: 0, end: 9999 }}
      defaultValue={selected}
      defaultViewDate={selected}
      disabled={disabled}
      onValueChange={({ year, month, day }) =>
        onChange(
          `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        )
      }
    />
  );
}

function SessionTimePicker({ value, onChange, disabled, label }: SessionScheduleFieldProps) {
  const valid = createSessionInputSchema.shape.startTime.safeParse(value).success;

  return (
    <TimePicker
      aria-label={`${label} 선택`}
      value={
        valid
          ? { hour: Number(value.slice(0, 2)), minute: Number(value.slice(3, 5)) }
          : { hour: 0, minute: 0 }
      }
      minuteStep={1}
      disabled={disabled}
      onValueChange={({ hour, minute }) =>
        onChange(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
      }
    />
  );
}
