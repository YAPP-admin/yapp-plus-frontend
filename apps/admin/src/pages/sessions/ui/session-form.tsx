/** 생성·수정 공통 모달입니다. 닫을 때 부모에서 해제하고 다른 세션은 새 key로 엽니다. */
import { useState } from 'react';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import {
  ContentDialog,
  Field,
  Portal,
  RadioGroup,
  RadioGroupField,
  TextField,
} from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
import { X } from 'lucide-react';
import type { CreateSessionInput } from '../model/session';
import { parseSessionForm, sessionFormDefaults, sessionFormErrors } from '../model/session-form';
import { coordinatesQueryOptions } from '../model/location/coordinates-query';
import type {
  AddressSearchItemViewModel,
  CoordinatesViewModel,
} from '../model/location/location-view-model';
import { AddressSearch } from './address-search';
import { SessionLocationMap } from './session-location-map';
import { SessionScheduleField } from './session-schedule-field';
import * as styles from './session-form.css';

const fields = [
  { name: 'name', label: '세션명', type: 'text' },
  { name: 'date', label: '날짜 (한국 시간)', type: 'date' },
  { name: 'startTime', label: '시작 시간', type: 'time' },
  { name: 'endTime', label: '종료 시간', type: 'time' },
] as const;

type Props = {
  initialValues?: CreateSessionInput;
  onSubmit: (value: CreateSessionInput) => void | Promise<void>;
  onClose: () => void;
};

export function SessionForm({ initialValues, onSubmit, onClose }: Props) {
  const [address, setAddress] = useState<AddressSearchItemViewModel | null>(null);
  const [adjusted, setAdjusted] = useState<CoordinatesViewModel>();
  const [submitError, setSubmitError] = useState('');
  const query = useQuery(coordinatesQueryOptions(address?.lookupReference ?? null));
  const stored = initialValues?.type === 'offline' ? initialValues.location : undefined;
  const roadAddress = address?.roadAddress ?? stored?.roadAddress ?? '';
  const initialPosition = address ? query.data : stored;
  const position = query.isFetching || query.isError ? undefined : (adjusted ?? initialPosition);
  const form = useForm({
    defaultValues: sessionFormDefaults(initialValues),
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: ({ value }) => sessionFormErrors(parseSessionForm(value, roadAddress, position)),
    },
    onSubmit: async ({ value }) => {
      const result = parseSessionForm(value, roadAddress, position);
      if (!result.success) {
        return;
      }
      try {
        await onSubmit(result.data);
      } catch {
        setSubmitError('저장하지 못했습니다. 입력을 유지했으니 다시 시도해 주세요.');
      }
    },
  });

  function close() {
    if (!form.state.isSubmitting) {
      onClose();
    }
  }

  return (
    <form.Subscribe
      selector={(state) => ({
        pending: state.isSubmitting,
        type: state.values.type,
        attempted: state.submissionAttempts > 0,
      })}
    >
      {({ pending, type, attempted }) => (
        <ContentDialog.Root
          open
          closeOnInteractOutside={false}
          closeOnEscape={!pending}
          onOpenChange={(open) => {
            if (!open) {
              close();
            }
          }}
        >
          <Portal>
            <ContentDialog.Backdrop />
            <ContentDialog.Positioner>
              {/* Portal 밖의 어드민 셸과 같은 다크 테마를 적용합니다. */}
              <ContentDialog.Content className={styles.dialog} data-seed-color-mode="dark-only">
                <ContentDialog.Header>
                  <ContentDialog.Title>
                    {initialValues ? '세션 수정' : '세션 추가'}
                  </ContentDialog.Title>
                  <ContentDialog.Description>
                    일정과 세션 장소를 입력해 주세요.
                  </ContentDialog.Description>
                  <ContentDialog.CloseButton disabled={pending} aria-label="닫기">
                    <X size={20} aria-hidden="true" />
                  </ContentDialog.CloseButton>
                </ContentDialog.Header>
                <form
                  className={styles.form}
                  aria-label="세션 입력"
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (form.state.isSubmitting) {
                      return;
                    }
                    setSubmitError('');
                    void form.handleSubmit();
                  }}
                >
                  <ContentDialog.Body className={styles.body}>
                    <fieldset disabled={pending} className={styles.fields}>
                      <div className={styles.schedule}>
                        {fields.map(({ name, label, type: inputType }) => (
                          <form.Field key={name} name={name}>
                            {(field) =>
                              inputType === 'text' ? (
                                <Field.Root
                                  className={styles.name}
                                  disabled={pending}
                                  invalid={field.state.meta.errors.length > 0}
                                >
                                  <Field.Label>{label}</Field.Label>
                                  <TextField.Root
                                    value={field.state.value}
                                    onValueChange={field.handleChange}
                                  >
                                    <TextField.Input
                                      name={name}
                                      type={inputType}
                                      onBlur={field.handleBlur}
                                    />
                                  </TextField.Root>
                                  <div className={styles.feedback}>
                                    {field.state.meta.errors.length > 0 && (
                                      <Field.ErrorMessage role="alert">
                                        {field.state.meta.errors.join(' ')}
                                      </Field.ErrorMessage>
                                    )}
                                  </div>
                                </Field.Root>
                              ) : (
                                <SessionScheduleField
                                  type={inputType}
                                  label={label}
                                  value={field.state.value}
                                  disabled={pending}
                                  error={field.state.meta.errors.join(' ')}
                                  onChange={field.handleChange}
                                  onBlur={field.handleBlur}
                                />
                              )
                            }
                          </form.Field>
                        ))}
                      </div>
                      <form.Field name="type">
                        {(field) => (
                          <RadioGroupField.Root
                            value={field.state.value}
                            disabled={pending}
                            onValueChange={(next) => {
                              if (next !== 'offline' && next !== 'team') {
                                return;
                              }
                              field.handleChange(next);
                            }}
                          >
                            <RadioGroupField.Label>세션 유형</RadioGroupField.Label>
                            <RadioGroup.Root className={styles.choices}>
                              {(['offline', 'team'] as const).map((value) => (
                                <RadioGroup.Item key={value} value={value}>
                                  <RadioGroup.ItemHiddenInput />
                                  <RadioGroup.ItemControl>
                                    <RadioGroup.ItemIndicator />
                                  </RadioGroup.ItemControl>
                                  <RadioGroup.ItemLabel>
                                    {value === 'offline' ? '오프라인' : '팀 세션'}
                                  </RadioGroup.ItemLabel>
                                </RadioGroup.Item>
                              ))}
                            </RadioGroup.Root>
                          </RadioGroupField.Root>
                        )}
                      </form.Field>
                      {type === 'offline' ? (
                        <section className={styles.fields} aria-label="오프라인 장소">
                          <AddressSearch
                            value={address}
                            disabled={pending}
                            onSelect={(next) => {
                              if (next.roadAddress === roadAddress) {
                                return;
                              }
                              setAddress(next);
                              setAdjusted(undefined);
                              form.setFieldValue('detailAddress', '');
                            }}
                          />
                          {!address && stored && <p>선택한 주소: {stored.roadAddress}</p>}
                          <form.Field name="detailAddress">
                            {(field) => (
                              <Field.Root disabled={pending}>
                                <Field.Label>상세주소 (선택)</Field.Label>
                                <TextField.Root
                                  value={field.state.value}
                                  onValueChange={field.handleChange}
                                >
                                  <TextField.Input placeholder="예: 교육장 3층 세미나실" />
                                </TextField.Root>
                              </Field.Root>
                            )}
                          </form.Field>
                          {query.isFetching && (
                            <output aria-live="polite">좌표를 조회하고 있습니다.</output>
                          )}
                          {query.isError && (
                            <div>
                              <p role="alert">좌표를 조회하지 못했습니다.</p>
                              <ActionButton
                                type="button"
                                variant="neutralWeak"
                                disabled={pending}
                                onClick={() => {
                                  void query.refetch();
                                }}
                              >
                                좌표 다시 조회
                              </ActionButton>
                            </div>
                          )}
                          {attempted && (!roadAddress || !position) && (
                            <p role="alert">주소를 선택하고 좌표 조회를 완료해 주세요.</p>
                          )}
                          {initialPosition && position && (
                            <SessionLocationMap
                              initialPosition={initialPosition}
                              position={position}
                              disabled={pending}
                              onChange={setAdjusted}
                            />
                          )}
                        </section>
                      ) : (
                        <form.Field name="guide">
                          {(field) => (
                            <Field.Root disabled={pending}>
                              <Field.Label>장소 안내 (선택)</Field.Label>
                              <TextField.Root
                                value={field.state.value}
                                onValueChange={field.handleChange}
                              >
                                <TextField.Input placeholder="예: 팀별로 정한 장소에서 진행" />
                              </TextField.Root>
                              <Field.Description>
                                비워 두면 ‘팀별 자율 장소’로 표시합니다.
                              </Field.Description>
                            </Field.Root>
                          )}
                        </form.Field>
                      )}
                    </fieldset>
                    {submitError && <p role="alert">{submitError}</p>}
                  </ContentDialog.Body>
                  <ContentDialog.Footer className={styles.actions}>
                    <ActionButton
                      type="button"
                      variant="neutralWeak"
                      disabled={pending}
                      onClick={close}
                    >
                      취소
                    </ActionButton>
                    <ActionButton
                      type="submit"
                      loading={pending}
                      disabled={pending || (type === 'offline' && query.isFetching)}
                    >
                      {pending ? '저장 중' : '저장'}
                    </ActionButton>
                  </ContentDialog.Footer>
                </form>
              </ContentDialog.Content>
            </ContentDialog.Positioner>
          </Portal>
        </ContentDialog.Root>
      )}
    </form.Subscribe>
  );
}
