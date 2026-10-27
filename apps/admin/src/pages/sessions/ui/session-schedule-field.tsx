/** 일정 선택창의 초안만 보관하고, 확인한 날짜·시간을 부모 폼에 전달합니다. */
import { useState } from 'react';
import { overlay } from 'overlay-kit';
import { ContentDialog, DatePicker, FieldButton, Portal, TimePicker } from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
import * as styles from './session-form.css';

type Props = {
  type: 'date' | 'time';
  label: string;
  value: string;
  disabled: boolean;
  error?: string;
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

export function SessionScheduleField({
  type,
  label,
  value,
  disabled,
  error,
  onChange,
  onBlur,
}: Props) {
  return (
    <FieldButton.Root values={value ? [value] : []} disabled={disabled} invalid={Boolean(error)}>
      <FieldButton.Label>{label}</FieldButton.Label>
      <FieldButton.Control>
        <FieldButton.Button
          type="button"
          aria-label={`${label}, ${value || '선택'}`}
          aria-haspopup="dialog"
          onClick={() => {
            overlay.open(({ unmount }) => (
              <SchedulePickerDialog
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
      <div className={styles.feedback}>
        {error && <FieldButton.ErrorMessage role="alert">{error}</FieldButton.ErrorMessage>}
      </div>
    </FieldButton.Root>
  );
}

/** 선택 중인 값은 이 모달 안에서만 유지하고 확인할 때 전달합니다. */
function SchedulePickerDialog({
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
    <ContentDialog.Root
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <Portal>
        <ContentDialog.Backdrop />
        <ContentDialog.Positioner>
          <ContentDialog.Content className={styles.pickerDialog} data-seed-color-mode="dark-only">
            <ContentDialog.Header>
              <ContentDialog.Title>{label} 선택</ContentDialog.Title>
            </ContentDialog.Header>
            <ContentDialog.Body>
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
            </ContentDialog.Body>
            <ContentDialog.Footer className={styles.actions}>
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
            </ContentDialog.Footer>
          </ContentDialog.Content>
        </ContentDialog.Positioner>
      </Portal>
    </ContentDialog.Root>
  );
}
