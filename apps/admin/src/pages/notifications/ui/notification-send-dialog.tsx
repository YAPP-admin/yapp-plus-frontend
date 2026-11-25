import { Dialog, Portal } from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
import { Clock3, Send, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import {
  isPastDateTime,
  notificationPositionOptions,
  notificationRoleOptions,
  toLocalDateTimeInputValue,
  toScheduledAt,
  type NotificationPosition,
  type NotificationRole,
  type NotificationSendValues,
} from '../model/notifications';
import * as styles from './notification-send-dialog.css';

export type NotificationSendDialogProps = {
  onClose: () => void;
  onSubmit: (values: NotificationSendValues) => void;
  isPending?: boolean;
  errorMessage?: string;
};

function getSubmitLabel(hasError: boolean) {
  return hasError ? '다시 시도' : '보내기';
}

export function NotificationSendDialog({
  onClose,
  onSubmit,
  isPending = false,
  errorMessage,
}: NotificationSendDialogProps) {
  const [role, setRole] = useState<NotificationRole>('PLAYER');
  const [selectedPosition, setSelectedPosition] = useState<NotificationPosition>('ALL');
  const [message, setMessage] = useState('');
  const [schedule, setSchedule] = useState<'now' | 'scheduled'>('now');
  const [scheduledAt, setScheduledAt] = useState('');

  const scheduleError =
    schedule === 'scheduled' && (scheduledAt.length === 0 || isPastDateTime(scheduledAt))
      ? '현재보다 늦은 예약 시각을 선택해 주세요.'
      : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (message.trim().length === 0 || scheduleError !== undefined) {
      return;
    }

    const normalizedScheduledAt = schedule === 'now' ? null : toScheduledAt(scheduledAt);
    if (normalizedScheduledAt === undefined) {
      return;
    }

    onSubmit({
      content: message,
      targetRole: role,
      position: selectedPosition,
      scheduledAt: normalizedScheduledAt,
    });
  }

  return (
    <Dialog.Root
      open
      closeOnInteractOutside={!isPending}
      onOpenChange={(open) => {
        if (!open && !isPending) {
          onClose();
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Positioner className={styles.positioner}>
          <Dialog.Content
            className={`${styles.dialog} ${styles.responsive}`}
            data-seed-color-mode="dark-only"
            aria-labelledby="notification-send-title"
          >
            <Dialog.Header className={styles.dialogHeader}>
              <div>
                <p className={styles.dialogEyebrow}>NEW NOTIFICATION</p>
                <Dialog.Title id="notification-send-title" className={styles.dialogTitle}>
                  알림 보내기
                </Dialog.Title>
                <Dialog.Description className={styles.dialogDescription}>
                  회원에게 보낼 푸시 알림을 설정해 주세요.
                </Dialog.Description>
              </div>
              <Dialog.CloseButton className={styles.closeButton} aria-label="닫기">
                <X size={16} aria-hidden="true" />
              </Dialog.CloseButton>
            </Dialog.Header>

            <form className={styles.form} aria-label="알림 보내기" onSubmit={handleSubmit}>
              <Dialog.Body className={styles.body}>
                <section className={styles.section} aria-labelledby="notification-target-title">
                  <div className={styles.stepHeader}>
                    <span className={styles.stepNumber}>01</span>
                    <div>
                      <h3 id="notification-target-title" className={styles.stepTitle}>
                        대상 설정
                      </h3>
                      <p className={styles.stepDescription}>알림을 받을 회원을 선택해요.</p>
                    </div>
                  </div>

                  <div className={styles.fieldLabel} id="notification-role-label">
                    권한 <span className={styles.required}>*</span>
                  </div>
                  <div
                    className={styles.roleGroup}
                    role="radiogroup"
                    aria-labelledby="notification-role-label"
                  >
                    {notificationRoleOptions.map((option) => {
                      const selected = role === option.value;
                      return (
                        <label
                          key={option.value}
                          className={`${styles.roleOption} ${selected ? styles.roleOptionSelected : ''}`}
                        >
                          <input
                            type="radio"
                            name="notification-role"
                            value={option.value}
                            checked={selected}
                            aria-label={option.label}
                            disabled={isPending}
                            className={styles.visuallyHidden}
                            onChange={() => setRole(option.value)}
                          />
                          <span
                            className={`${styles.radioMark} ${selected ? styles.radioMarkSelected : ''}`}
                            aria-hidden="true"
                          />
                          <span className={styles.optionText}>{option.label}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div className={styles.disciplineFieldLabel} id="notification-discipline-label">
                    <span>
                      직군 <span className={styles.required}>*</span>
                    </span>
                    <span className={styles.disciplineHint}>
                      29기부터 Android, iOS 같은 경우 Mobile로 통합됨
                    </span>
                  </div>
                  <fieldset className={styles.disciplineRow}>
                    <legend className={styles.visuallyHidden}>직군</legend>
                    {notificationPositionOptions.map((option) => {
                      const selected = selectedPosition === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={selected}
                          disabled={isPending}
                          className={`${styles.disciplineOption} ${selected ? styles.disciplineOptionSelected : ''}`}
                          onClick={() => setSelectedPosition(option.value)}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </fieldset>
                </section>

                <section className={styles.section} aria-labelledby="notification-content-title">
                  <div className={styles.stepHeader}>
                    <span className={styles.stepNumber}>02</span>
                    <div>
                      <h3 id="notification-content-title" className={styles.stepTitle}>
                        알림 내용
                      </h3>
                      <p className={styles.stepDescription}>
                        회원의 알림 화면에 표시될 내용이에요.
                      </p>
                    </div>
                  </div>
                  <label className={styles.textareaLabel} htmlFor="notification-message">
                    내용 <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="notification-message"
                    className={styles.textarea}
                    placeholder="알림 내용을 입력해 주세요"
                    value={message}
                    disabled={isPending}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                </section>

                <section className={styles.section} aria-labelledby="notification-schedule-title">
                  <div className={styles.stepHeader}>
                    <span className={styles.stepNumber}>03</span>
                    <div>
                      <h3 id="notification-schedule-title" className={styles.stepTitle}>
                        발송 시점
                      </h3>
                      <p className={styles.stepDescription}>
                        지금 보내거나 원하는 시각에 예약해요.
                      </p>
                    </div>
                  </div>
                  <div className={styles.scheduleGroup} role="radiogroup" aria-label="발송 시점">
                    <label
                      className={`${styles.scheduleOption} ${schedule === 'now' ? styles.scheduleOptionSelected : ''}`}
                    >
                      <input
                        type="radio"
                        name="notification-schedule"
                        value="now"
                        checked={schedule === 'now'}
                        aria-label="즉시 발송"
                        disabled={isPending}
                        className={styles.visuallyHidden}
                        onChange={() => setSchedule('now')}
                      />
                      <Send className={styles.scheduleIcon} size={17} aria-hidden="true" />
                      <span className={styles.scheduleText}>
                        <span className={styles.scheduleTitle}>즉시 발송</span>
                        <span className={styles.scheduleDescription}>확인 후 바로 보내요</span>
                      </span>
                      <span
                        className={`${styles.radioMark} ${styles.scheduleRadioMark} ${schedule === 'now' ? styles.radioMarkSelected : ''}`}
                      />
                    </label>
                    <label
                      className={`${styles.scheduleOption} ${schedule === 'scheduled' ? styles.scheduleOptionSelected : ''}`}
                    >
                      <input
                        type="radio"
                        name="notification-schedule"
                        value="scheduled"
                        checked={schedule === 'scheduled'}
                        aria-label="예약 발송"
                        disabled={isPending}
                        className={styles.visuallyHidden}
                        onChange={() => setSchedule('scheduled')}
                      />
                      <Clock3 className={styles.scheduleIcon} size={17} aria-hidden="true" />
                      <span className={styles.scheduleText}>
                        <span className={styles.scheduleTitle}>예약 발송</span>
                        <span className={styles.scheduleDescription}>지정한 시각에 보내요</span>
                      </span>
                      <span
                        className={`${styles.radioMark} ${styles.scheduleRadioMark} ${schedule === 'scheduled' ? styles.radioMarkSelected : ''}`}
                      />
                    </label>
                  </div>
                  {schedule === 'scheduled' && (
                    <div className={styles.scheduleDateField}>
                      <label className={styles.datetimeLabel} htmlFor="notification-scheduled-at">
                        예약 시각 <span className={styles.required}>*</span>
                      </label>
                      <input
                        id="notification-scheduled-at"
                        className={styles.datetimeInput}
                        type="datetime-local"
                        value={scheduledAt}
                        min={toLocalDateTimeInputValue(new Date())}
                        disabled={isPending}
                        aria-invalid={scheduleError !== undefined}
                        onChange={(event) => setScheduledAt(event.target.value)}
                      />
                    </div>
                  )}
                  {(scheduleError !== undefined || errorMessage !== undefined) && (
                    <p className={styles.formError} role="alert">
                      {scheduleError ?? errorMessage}
                    </p>
                  )}
                </section>
              </Dialog.Body>

              <Dialog.Footer className={styles.footer}>
                <p className={styles.recipientCount}>선택한 대상과 직군으로 발송해요.</p>
                <div className={styles.footerActions}>
                  <ActionButton
                    type="button"
                    variant="neutralWeak"
                    className={styles.cancelButton}
                    onClick={onClose}
                  >
                    취소
                  </ActionButton>
                  <ActionButton
                    type="submit"
                    variant="neutralWeak"
                    disabled={
                      isPending || message.trim().length === 0 || scheduleError !== undefined
                    }
                    loading={isPending}
                    className={`${styles.submitButton} ${message.trim().length > 0 && scheduleError === undefined ? styles.submitButtonEnabled : ''}`}
                  >
                    {getSubmitLabel(errorMessage !== undefined)}
                  </ActionButton>
                </div>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
