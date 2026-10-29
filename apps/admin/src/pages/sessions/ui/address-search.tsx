/** 세션 폼에 넣는 주소 검색 영역입니다. 선택값은 부모가 소유하고 검색 요청만 내부에서 관리합니다. */
import { useForm, useStore } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { useId, useState } from 'react';
import { Field, TextField } from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
import {
  addressSearchQueryOptions,
  isAddressSearchAvailable,
} from '../model/location/address-search-query';
import { getAddressSearchError } from '../model/location/address-search-error';
import type { AddressSearchItemViewModel } from '../model/location/location-view-model';
import * as styles from './address-search.css';

type Props = {
  value: AddressSearchItemViewModel | null;
  onSelect: (address: AddressSearchItemViewModel) => void;
  disabled?: boolean;
};

/** 좌표 조회의 식별자를 모두 포함해 같은 주소 재선택으로 부모 초안을 초기화하지 않습니다. */
function addressIdentity(item: AddressSearchItemViewModel): string {
  const ref = item.lookupReference;
  return JSON.stringify([
    item.roadAddress,
    ref.administrativeAreaCode,
    ref.roadNameManagementNumber,
    ref.isUnderground,
    ref.buildingMainNumber,
    ref.buildingSubNumber,
    ref.buildingManagementNumber,
  ]);
}

/** 입력이 300ms 동안 멈추면 검색하고 페이지 이동은 즉시 조회합니다. */
export function AddressSearch({ value, onSelect, disabled = false }: Props) {
  const id = useId();
  const [conditions, setConditions] = useState({ keyword: '', page: 1 });
  const form = useForm({
    defaultValues: { keyword: '' },
    listeners: {
      onChangeDebounceMs: 300,
      onChange: ({ formApi }) =>
        setConditions({ keyword: formApi.state.values.keyword.trim(), page: 1 }),
    },
  });
  const keyword = useStore(form.store, (state) => state.values.keyword.trim());
  const searchKeyword = conditions.keyword;
  const unavailable = !isAddressSearchAvailable();
  const options = addressSearchQueryOptions(conditions);
  const query = useQuery({ ...options, enabled: options.enabled && !!keyword && !disabled });
  const paused = !!keyword && query.fetchStatus === 'paused';
  const loading = !!keyword && (keyword !== searchKeyword || query.isFetching || paused);
  // 새 결과가 올 때까지 목록을 유지하되 조회 중 선택과 페이지 이동은 막습니다.
  const data =
    keyword && !query.isError && query.data?.status === 'success' ? query.data.data : undefined;
  const serviceError = query.data?.status === 'service-error' ? query.data.code : undefined;
  const error =
    !keyword || loading || query.isPlaceholderData
      ? null
      : getAddressSearchError(query.error, serviceError);

  return (
    <section className={styles.root} aria-label="주소 검색">
      <div className={styles.searchRow}>
        <form.Field name="keyword">
          {(field) => (
            <Field.Root className={styles.field} disabled={disabled || unavailable}>
              <Field.Label>도로명주소 검색</Field.Label>
              <TextField.Root
                value={field.state.value}
                onValueChange={(text) => {
                  field.handleChange(text);
                  if (!text.trim()) {
                    setConditions({ keyword: '', page: 1 });
                  }
                }}
              >
                <TextField.Input
                  type="search"
                  placeholder="예: 세종대로 110"
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby={`${id}-hint`}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') {
                      return;
                    }
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                />
              </TextField.Root>
            </Field.Root>
          )}
        </form.Field>
      </div>
      <p id={`${id}-hint`} className={styles.hint}>
        도로명과 건물번호를 입력하면 자동으로 검색합니다.
      </p>
      {value && (
        <div className={styles.selection}>
          <span>선택한 주소</span>
          <strong>{value.roadAddress}</strong>
        </div>
      )}
      <div className={styles.status}>
        {unavailable || error ? (
          <p role="alert" className={styles.statusMessage}>
            {unavailable
              ? '주소 검색 설정이 준비되지 않았습니다. 관리자에게 문의해 주세요.'
              : error?.message}
          </p>
        ) : (
          <output aria-live="polite" className={styles.statusMessage}>
            {paused && '네트워크 연결을 기다리고 있습니다.'}
            {loading && !paused && '주소를 검색하고 있습니다.'}
            {!loading && !data && '검색 결과에서 세션 장소를 선택해 주세요.'}
            {!loading &&
              data?.items.length === 0 &&
              '검색 결과가 없습니다. 검색어를 바꿔 다시 검색해 주세요.'}
            {!loading &&
              data &&
              data.items.length > 0 &&
              `“${searchKeyword}” 검색 결과 ${data.totalCount.toLocaleString('ko-KR')}개 · ${data.page}페이지`}
          </output>
        )}
        {error?.retry && (
          <ActionButton
            type="button"
            variant="neutralWeak"
            disabled={disabled}
            onClick={() => void query.refetch({ cancelRefetch: false })}
          >
            다시 검색
          </ActionButton>
        )}
      </div>
      {data && (
        <>
          {data.items.length > 0 && (
            <ul className={styles.results} aria-label="주소 검색 결과" aria-busy={loading}>
              {data.items.map((item) => {
                const selected = !!value && addressIdentity(value) === addressIdentity(item);
                return (
                  <li key={addressIdentity(item)}>
                    <button
                      type="button"
                      className={styles.result}
                      disabled={disabled || loading || query.isPlaceholderData}
                      aria-pressed={selected}
                      onClick={() => {
                        if (!selected) {
                          onSelect(item);
                        }
                      }}
                    >
                      <span>{item.roadAddress}</span>
                      <span className={styles.badge}>{selected ? '선택됨' : '선택'}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {data.totalCount > 0 && (
            <nav className={styles.pages} aria-label="주소 검색 페이지">
              <ActionButton
                type="button"
                variant="neutralWeak"
                disabled={disabled || loading || query.isPlaceholderData || !data.hasPreviousPage}
                onClick={() => setConditions({ keyword: searchKeyword, page: data.page - 1 })}
              >
                이전
              </ActionButton>
              <span>
                {data.page} / {Math.max(1, Math.ceil(data.totalCount / data.pageSize))}
              </span>
              <ActionButton
                type="button"
                variant="neutralWeak"
                disabled={disabled || loading || query.isPlaceholderData || !data.hasNextPage}
                onClick={() => setConditions({ keyword: searchKeyword, page: data.page + 1 })}
              >
                다음
              </ActionButton>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
