/** 세션 폼에 넣는 주소 검색 영역입니다. 선택값은 부모가 소유하고 검색 요청만 내부에서 관리합니다. */
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

/** 입력한 검색어와 페이지를 Query 조건으로 사용해 자동 검색합니다. */
export function AddressSearch({ value, onSelect, disabled = false }: Props) {
  const id = useId();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const searchKeyword = keyword.trim();
  const unavailable = !isAddressSearchAvailable();
  const options = addressSearchQueryOptions({ keyword: searchKeyword, page });
  const query = useQuery({ ...options, enabled: options.enabled && !disabled });
  const loading = query.isFetching;
  // 재조회 중이나 실패 후에는 캐시된 이전 결과를 선택할 수 없게 합니다.
  const data =
    !loading && !query.isError && query.data?.status === 'success' ? query.data.data : undefined;
  const serviceError = query.data?.status === 'service-error' ? query.data.code : undefined;
  const error = loading ? null : getAddressSearchError(query.error, serviceError);

  return (
    <section className={styles.root} aria-label="주소 검색">
      <div className={styles.searchRow}>
        <Field.Root className={styles.field} disabled={disabled || unavailable}>
          <Field.Label>도로명주소 검색</Field.Label>
          <TextField.Root
            value={keyword}
            onValueChange={(text) => {
              setKeyword(text);
              setPage(1);
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
      </div>
      <p id={`${id}-hint`} className={styles.hint}>
        도로명과 건물번호를 입력하면 자동으로 검색합니다.
      </p>
      {unavailable && (
        <p role="alert">주소 검색 설정이 준비되지 않았습니다. 관리자에게 문의해 주세요.</p>
      )}
      {value && (
        <div className={styles.selection}>
          <span>선택한 주소</span>
          <strong>{value.roadAddress}</strong>
        </div>
      )}
      <output aria-live="polite" className={styles.hint}>
        {loading && '주소를 검색하고 있습니다.'}
        {data &&
          `“${searchKeyword}” 검색 결과 ${data.totalCount.toLocaleString('ko-KR')}개 · ${data.page}페이지`}
        {!loading && !data && !error && !unavailable && '검색 결과에서 세션 장소를 선택해 주세요.'}
      </output>
      {error && (
        <div className={styles.error}>
          <p role="alert">{error.message}</p>
          {error.retry && (
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
      )}
      {data && (
        <>
          {data.items.length === 0 ? (
            <p className={styles.empty}>검색 결과가 없습니다. 검색어를 바꿔 다시 검색해 주세요.</p>
          ) : (
            <ul className={styles.results} aria-label="주소 검색 결과">
              {data.items.map((item) => {
                const selected = !!value && addressIdentity(value) === addressIdentity(item);
                return (
                  <li key={addressIdentity(item)}>
                    <button
                      type="button"
                      className={styles.result}
                      disabled={disabled}
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
                disabled={disabled || !data.hasPreviousPage}
                onClick={() => setPage(data.page - 1)}
              >
                이전
              </ActionButton>
              <span>
                {data.page} / {Math.max(1, Math.ceil(data.totalCount / data.pageSize))}
              </span>
              <ActionButton
                type="button"
                variant="neutralWeak"
                disabled={disabled || !data.hasNextPage}
                onClick={() => setPage(data.page + 1)}
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
