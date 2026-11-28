/** 세션 폼의 이름·유형·장소 입력을 제어형 화면 컴포넌트로 제공합니다. */
import { Field, RadioGroup, RadioGroupField, TextField } from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
import { useState, type Ref } from 'react';
import type { SessionInput } from '../model/session-form';
import type {
  AddressSearchItemViewModel,
  CoordinatesViewModel,
} from '../model/location/location-view-model';
import { AddressSearch } from './address-search';
import { SessionLocationMap } from './session-location-map';
import * as styles from './session-form.css';
import * as addressStyles from './address-search.css';

/** Standard Schema issue를 필드에 표시할 단일 문구로 바꿉니다. */
export function getFieldErrorMessage(errors: readonly unknown[]) {
  return errors
    .map((error) => {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        return String(error.message);
      }
      return String(error);
    })
    .join(' ');
}

/** 세션명의 제어 값과 검증 상태를 SEED 입력에 연결합니다. */
export function SessionNameField({
  value,
  error,
  disabled,
  onChange,
  onBlur,
}: {
  value: string;
  error: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <Field.Root className={styles.name} disabled={disabled} invalid={Boolean(error)}>
      <Field.Label>세션명</Field.Label>
      <TextField.Root value={value} onValueChange={onChange}>
        <TextField.Input name="name" type="text" required onBlur={onBlur} />
      </TextField.Root>
      <div className={styles.feedback}>
        {error && <Field.ErrorMessage role="alert">{error}</Field.ErrorMessage>}
      </div>
    </Field.Root>
  );
}

/** 정규·팀 세션 중 하나를 고르는 제어형 필드입니다. */
export function SessionTypeField({
  value,
  disabled,
  onChange,
}: {
  value: SessionInput['type'];
  disabled: boolean;
  onChange: (value: SessionInput['type']) => void;
}) {
  return (
    <RadioGroupField.Root
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        if (next === 'regular' || next === 'team') {
          onChange(next);
        }
      }}
    >
      <RadioGroupField.Label>세션 유형</RadioGroupField.Label>
      <RadioGroup.Root className={styles.choices}>
        {(['regular', 'team'] as const).map((type) => (
          <RadioGroup.Item key={type} value={type}>
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemControl>
              <RadioGroup.ItemIndicator />
            </RadioGroup.ItemControl>
            <RadioGroup.ItemLabel>
              {type === 'regular' ? '정규 세션' : '팀 세션'}
            </RadioGroup.ItemLabel>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </RadioGroupField.Root>
  );
}

/** 현재 폼의 장소를 표시하고 저장된 장소도 해제합니다. 검색 초안은 해제 시 유지합니다. */
export function SessionAddressField({
  value,
  roadAddress,
  error,
  disabled,
  onSelect,
  onClear,
  inputRef,
}: {
  value: AddressSearchItemViewModel | null;
  roadAddress: string;
  error: string;
  disabled: boolean;
  onSelect: (address: AddressSearchItemViewModel) => void;
  onClear: () => void;
  inputRef: Ref<HTMLInputElement>;
}) {
  const [cleared, setCleared] = useState(false);
  return (
    <div className={addressStyles.root}>
      {roadAddress && (
        <section className={addressStyles.selection} aria-label="선택한 장소">
          <div className={addressStyles.selectionHeading}>
            <span>선택한 장소</span>
            <ActionButton
              type="button"
              variant="neutralWeak"
              className={addressStyles.clearButton}
              disabled={disabled}
              onClick={() => {
                onClear();
                setCleared(true);
              }}
            >
              장소 해제
            </ActionButton>
          </div>
          {value?.buildingName && <strong>{value.buildingName}</strong>}
          <span>{roadAddress}</span>
        </section>
      )}
      <output aria-live="polite">
        {cleared && !roadAddress ? '장소 선택을 해제했습니다.' : ''}
      </output>
      <AddressSearch
        value={value}
        disabled={disabled}
        inputRef={inputRef}
        onSelect={(next) => {
          setCleared(false);
          onSelect(next);
        }}
      />
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

/** 선택 장소의 상세주소 초안과 길이 제한을 연결합니다. */
export function SessionDetailAddressField({
  value,
  error,
  disabled,
  onChange,
  onBlur,
  inputRef,
}: {
  value: string;
  error: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef?: Ref<HTMLInputElement>;
}) {
  return (
    <Field.Root disabled={disabled} invalid={Boolean(error)}>
      <Field.Label>상세주소 (선택)</Field.Label>
      <TextField.Root value={value} onValueChange={onChange}>
        <TextField.Input
          ref={inputRef}
          name="detailAddress"
          maxLength={255}
          placeholder="예: 교육장 3층 세미나실"
          onBlur={onBlur}
        />
      </TextField.Root>
      {error && <Field.ErrorMessage role="alert">{error}</Field.ErrorMessage>}
    </Field.Root>
  );
}

/** 좌표 조회 상태와 지도 위치 조정을 하나의 장소 영역으로 표시합니다. */
export function SessionCoordinatesField({
  position,
  initialPosition,
  lookupPending,
  lookupError,
  disabled,
  onRetry,
  onChange,
}: {
  position?: CoordinatesViewModel;
  initialPosition?: CoordinatesViewModel;
  lookupPending: boolean;
  lookupError: boolean;
  disabled: boolean;
  onRetry: () => void;
  onChange: (position: CoordinatesViewModel) => void;
}) {
  return (
    <>
      {lookupPending && <output aria-live="polite">좌표를 조회하고 있습니다.</output>}
      {lookupError && (
        <div>
          <p role="alert">좌표를 조회하지 못했습니다.</p>
          <ActionButton type="button" variant="neutralWeak" disabled={disabled} onClick={onRetry}>
            좌표 다시 조회
          </ActionButton>
        </div>
      )}
      {initialPosition && position && (
        <SessionLocationMap
          initialPosition={initialPosition}
          position={position}
          disabled={disabled}
          onChange={onChange}
        />
      )}
    </>
  );
}
