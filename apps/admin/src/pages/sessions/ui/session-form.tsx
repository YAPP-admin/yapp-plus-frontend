/** 생성·수정 공통 모달입니다. 닫을 때 부모에서 해제하고 다른 세션은 새 key로 엽니다. */
import { useState } from 'react';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import {
  createSessionFormSchema,
  parseSessionForm,
  sessionFormDefaults,
  toCoordinatesViewModel,
  type SessionInput,
} from '../model/session-form';
import { coordinatesMutationOptions } from '../model/location/coordinates-mutation';
import type { AddressSearchItemViewModel } from '../model/location/location-view-model';
import { SessionFormDialog } from './session-form-dialog';
import {
  getFieldErrorMessage,
  SessionAddressField,
  SessionCoordinatesField,
  SessionDetailAddressField,
  SessionNameField,
  SessionTypeField,
} from './session-form-fields';
import { SessionScheduleField } from './session-schedule-field';
import * as styles from './session-form.css';

const SESSION_FIELDS = [
  { name: 'name', label: '세션명', type: 'text' },
  { name: 'date', label: '날짜 (한국 시간)', type: 'date' },
  { name: 'startTime', label: '시작 시간', type: 'time' },
  { name: 'endTime', label: '종료 시간', type: 'time' },
] as const;

type Props = {
  initialValues?: SessionInput;
  submissionPending?: boolean;
  submissionError?: string;
  onSubmit: (value: SessionInput) => void | Promise<void>;
  onClose: () => void;
};

export function SessionForm({
  initialValues,
  submissionPending = false,
  submissionError = '',
  onSubmit,
  onClose,
}: Props) {
  const [address, setAddress] = useState<AddressSearchItemViewModel | null>(null);
  const [localSubmissionError, setLocalSubmissionError] = useState('');
  const coordinates = useMutation(coordinatesMutationOptions);
  const stored = initialValues?.type === 'regular' ? initialValues.location : undefined;
  const form = useForm({
    defaultValues: sessionFormDefaults(initialValues),
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createSessionFormSchema(initialValues),
    },
    onSubmit: async ({ value }) => {
      const result = parseSessionForm(value, initialValues);
      if (!result.success) {
        return;
      }
      try {
        await onSubmit(result.data);
      } catch {
        setLocalSubmissionError('저장하지 못했습니다. 입력을 유지했으니 다시 시도해 주세요.');
      }
    },
  });

  function lookupSelectedAddressCoordinates(next: AddressSearchItemViewModel) {
    // 호출별 콜백은 마지막 주소 선택과 마운트된 폼에만 적용되어 늦은 응답을 격리합니다.
    coordinates.mutate(next.lookupReference, {
      onSuccess: (point) => {
        form.setFieldValue('location.latitude', point.latitude);
        form.setFieldValue('location.longitude', point.longitude);
      },
    });
  }

  function close() {
    if (!form.state.isSubmitting && !submissionPending) {
      onClose();
    }
  }

  return (
    <form.Subscribe
      selector={(state) => ({
        pending: state.isSubmitting,
        type: state.values.type,
        location: state.values.location,
      })}
    >
      {({ pending, type, location }) => {
        const isPending = pending || submissionPending;
        const position = toCoordinatesViewModel(location);
        const initialPosition = address ? coordinates.data : stored;

        return (
          <SessionFormDialog
            title={initialValues ? '세션 수정' : '세션 추가'}
            pending={isPending}
            submitDisabled={type === 'regular' && coordinates.isPending}
            submitError={submissionError || localSubmissionError}
            onClose={close}
            onSubmit={(event) => {
              event.preventDefault();
              if (form.state.isSubmitting || submissionPending) {
                return;
              }
              setLocalSubmissionError('');
              void form.handleSubmit();
            }}
          >
            <div className={styles.fields}>
              <div className={styles.schedule}>
                {SESSION_FIELDS.map(({ name, label, type: inputType }) => (
                  <form.Field key={name} name={name}>
                    {(field) => {
                      const error = getFieldErrorMessage(field.state.meta.errors);
                      return inputType === 'text' ? (
                        <SessionNameField
                          value={field.state.value}
                          error={error}
                          disabled={isPending}
                          onChange={field.handleChange}
                          onBlur={field.handleBlur}
                        />
                      ) : (
                        <SessionScheduleField
                          type={inputType}
                          label={label}
                          value={field.state.value}
                          disabled={isPending}
                          error={error}
                          onChange={field.handleChange}
                          onBlur={field.handleBlur}
                        />
                      );
                    }}
                  </form.Field>
                ))}
              </div>
              <form.Field name="type">
                {(field) => (
                  <SessionTypeField
                    value={field.state.value}
                    disabled={isPending}
                    onChange={field.handleChange}
                  />
                )}
              </form.Field>
              {type === 'regular' ? (
                <section className={styles.fields} aria-label="정규 세션 장소">
                  <form.Field name="location.roadAddress">
                    {(field) => (
                      <SessionAddressField
                        value={address}
                        storedRoadAddress={stored?.roadAddress}
                        error={getFieldErrorMessage(field.state.meta.errors)}
                        disabled={isPending}
                        onSelect={(next) => {
                          if (next.roadAddress === field.state.value) {
                            return;
                          }
                          setAddress(next);
                          field.handleChange(next.roadAddress);
                          form.setFieldValue('location.detailAddress', '');
                          form.setFieldValue('location.latitude', undefined);
                          form.setFieldValue('location.longitude', undefined);
                          lookupSelectedAddressCoordinates(next);
                        }}
                      />
                    )}
                  </form.Field>
                  <form.Field name="location.detailAddress">
                    {(field) => (
                      <SessionDetailAddressField
                        value={field.state.value}
                        error={getFieldErrorMessage(field.state.meta.errors)}
                        disabled={isPending}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                      />
                    )}
                  </form.Field>
                  <SessionCoordinatesField
                    initialPosition={initialPosition}
                    position={position}
                    lookupPending={coordinates.isPending}
                    lookupError={coordinates.isError}
                    disabled={isPending}
                    onRetry={() => {
                      if (address) {
                        lookupSelectedAddressCoordinates(address);
                      }
                    }}
                    onChange={(next) => {
                      form.setFieldValue('location.latitude', next.latitude);
                      form.setFieldValue('location.longitude', next.longitude);
                    }}
                  />
                </section>
              ) : null}
            </div>
          </SessionFormDialog>
        );
      }}
    </form.Subscribe>
  );
}
