/** 공지 마감 날짜·시간을 Seed DatePicker와 TimePicker로 선택한다. */
import { useState } from 'react';
import { overlay } from 'overlay-kit';
import { Dialog, FieldButton, Portal } from '@seed-design/react';
import { ActionButton, DatePicker, TimePicker } from '@yapp-plus/ui';
import * as styles from './notice-form.css';

type Props = {
  type: 'date' | 'time';
  label: string;
  value: string;
  required?: boolean;
  disabled: boolean;
  errors: (string | undefined)[];
  onChange: (value: string) => void;
  onBlur: () => void;
};

function calendarDate(value: string) {
  return {
    year: Number(value.slice(0, 4)),
    month: Number(value.slice(5, 7)),
    day: Number(value.slice(8, 10)),
  };
}

function twoDigits(value: number) {
  return String(value).padStart(2, '0');
}

/** 선택된 값과 오류를 폼 필드로 연결하고, 선택창은 열 때만 생성한다. */
export function NoticeScheduleField({
  type,
  label,
  value,
  required = false,
  disabled,
  errors,
  onChange,
  onBlur,
}: Props) {
  return (
    <FieldButton.Root values={value ? [value] : []} disabled={disabled} invalid={errors.length > 0}>
      <FieldButton.Label>{label}</FieldButton.Label>
      <FieldButton.Control>
        <FieldButton.Button
          type="button"
          aria-label={`${label}, ${value || '선택'}`}
          aria-haspopup="dialog"
          aria-required={required}
          onClick={() => {
            overlay.open(({ unmount }) => (
              <NoticeSchedulePickerDialog
                type={type}
                label={label}
                value={value}
                onConfirm={onChange}
                onClose={unmount}
              />
            ));
          }}
          onBlur={onBlur}
        />
        {value ? (
          <FieldButton.Value>{value}</FieldButton.Value>
        ) : (
          <FieldButton.Placeholder>선택해 주세요</FieldButton.Placeholder>
        )}
      </FieldButton.Control>
      <div>
        {errors.length > 0 && (
          <FieldButton.ErrorMessage role="alert">{errors.join(' ')}</FieldButton.ErrorMessage>
        )}
      </div>
    </FieldButton.Root>
  );
}

/** 선택 중인 값은 다이얼로그 안에서만 유지하고 확인할 때 폼에 반영한다. */
function NoticeSchedulePickerDialog({
  type,
  label,
  value,
  onConfirm,
  onClose,
}: Pick<Props, 'type' | 'label' | 'value'> & {
  onConfirm: (value: string) => void;
  onClose: () => void;
}) {
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  const [draft, setDraft] = useState(value || (type === 'date' ? today : '00:00'));

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content className={styles.pickerDialog} data-seed-color-mode="dark-only">
            <Dialog.Header>
              <Dialog.Title>{label} 선택</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              {type === 'date' ? (
                <DatePicker
                  locale="ko-KR"
                  today={calendarDate(today)}
                  value={calendarDate(draft)}
                  onValueChange={({ year, month, day }) =>
                    setDraft(
                      `${String(year).padStart(4, '0')}-${twoDigits(month)}-${twoDigits(day)}`,
                    )
                  }
                />
              ) : (
                <TimePicker
                  locale="ko-KR"
                  minuteStep={1}
                  value={{ hour: Number(draft.slice(0, 2)), minute: Number(draft.slice(3, 5)) }}
                  onValueChange={({ hour, minute }) =>
                    setDraft(`${twoDigits(hour)}:${twoDigits(minute)}`)
                  }
                />
              )}
            </Dialog.Body>
            <Dialog.Footer className={styles.pickerActions}>
              <ActionButton type="button" variant="neutralWeak" onClick={onClose}>
                취소
              </ActionButton>
              <ActionButton
                type="button"
                onClick={() => {
                  onConfirm(draft);
                  onClose();
                }}
              >
                확인
              </ActionButton>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
