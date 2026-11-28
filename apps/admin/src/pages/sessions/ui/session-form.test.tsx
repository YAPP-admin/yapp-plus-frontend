/** 공통 폼의 저장 계약·유형별 초안·비동기 조회·닫기 차단을 검증합니다. */
import { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createAdminQueryClient } from '../../../query-client';
import { lookupCoordinates } from '../model/location/coordinates';
import type {
  AddressSearchItemViewModel,
  CoordinatesViewModel,
} from '../model/location/location-view-model';
import { parseSessionForm, type SessionFormValues, type SessionInput } from '../model/session-form';
import { SessionForm } from './session-form';

// 폼·목록 테스트는 저장 계약에 집중하고 실제 Picker 조작은 별도 테스트에서 검증합니다.
vi.mock('./session-schedule-field', () => ({
  SessionScheduleField: ({
    label,
    value,
    disabled,
    error,
    onChange,
  }: {
    label: string;
    value: string;
    disabled: boolean;
    error?: string;
    onChange: (value: string) => void;
  }) => (
    <label>
      {label}
      <input
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <span role="alert">{error}</span>}
    </label>
  ),
}));

vi.mock('../model/location/coordinates', () => ({
  lookupCoordinates: vi.fn<typeof lookupCoordinates>(),
}));
vi.mock('./address-search', () => ({
  AddressSearch: ({
    onSelect,
    disabled,
  }: {
    onSelect: (address: AddressSearchItemViewModel) => void;
    disabled: boolean;
  }) => (
    <div>
      {['주소 A', '주소 B', '같은 주소의 다른 건물'].map((label) => (
        // 마지막 결과는 도로명주소가 같고 건물 관리번호만 다른 공급자 사례입니다.
        <button
          key={label}
          type="button"
          disabled={disabled}
          onClick={() =>
            onSelect({
              roadAddress: label === '같은 주소의 다른 건물' ? '주소 A' : label,
              lookupReference: {
                administrativeAreaCode: '1',
                roadNameManagementNumber: '1',
                isUnderground: false,
                buildingMainNumber: '1',
                buildingSubNumber: '0',
                buildingManagementNumber: label,
              },
            })
          }
        >
          {label}
        </button>
      ))}
    </div>
  ),
}));
vi.mock('./session-location-map', () => ({
  SessionLocationMap: ({
    position,
    initialPosition,
    onChange,
    disabled,
  }: {
    position: CoordinatesViewModel;
    initialPosition: CoordinatesViewModel;
    onChange: (position: CoordinatesViewModel) => void;
    disabled: boolean;
  }) => (
    <div>
      <output>
        {position.latitude}, {position.longitude}
      </output>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange({ latitude: 36, longitude: 128 })}
      >
        마커 조정
      </button>
      <button type="button" disabled={disabled} onClick={() => onChange(initialPosition)}>
        초기 위치로 되돌리기
      </button>
    </div>
  ),
}));
const lookup = vi.mocked(lookupCoordinates);
const initial = {
  name: '기존 세션',
  startDate: '2020-01-01',
  endDate: '2020-01-01',
  startTime: '13:00:10',
  endTime: '17:00:20',
  type: 'regular',
  location: { roadAddress: '저장된 주소', detailAddress: '3층', latitude: 37, longitude: 127 },
} satisfies Extract<SessionInput, { type: 'regular' }>;
function setup(
  initialValues?: SessionInput,
  save = vi.fn<(value: SessionInput) => Promise<void>>().mockResolvedValue(undefined),
) {
  const close = vi.fn<() => void>();
  function Harness() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <button onClick={() => setOpen(true)}>폼 열기</button>
        {open && (
          <SessionForm
            initialValues={initialValues}
            onSubmit={save}
            onClose={() => {
              close();
              setOpen(false);
            }}
          />
        )}
      </>
    );
  }
  const client = createAdminQueryClient();
  render(
    <QueryClientProvider client={client}>
      <Harness />
    </QueryClientProvider>,
  );
  return { user: userEvent.setup(), save, close, client };
}
function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}
beforeEach(() => {
  vi.stubEnv('SSR', false);
  vi.stubEnv('VITE_JUSO_COORD_KEY', 'test-coordinate-key');
  lookup.mockResolvedValue({ status: 'success', data: { latitude: 38, longitude: 129 } });
});
afterEach(() => {
  vi.unstubAllEnvs();
  lookup.mockReset();
});

it('수정 좌표는 재조회 없이 복원하고 조정한 좌표와 공백 정리한 상세주소를 저장한다', async () => {
  const { user, save } = setup(initial);
  expect(screen.getByText('37, 127')).toBeInTheDocument();
  expect(lookup).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: '마커 조정' }));
  fill('상세주소 (선택)', '  교육장 4층  ');
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(save).toHaveBeenCalledWith({
    ...initial,
    location: { ...initial.location, detailAddress: '교육장 4층', latitude: 36, longitude: 128 },
  });
});
it('저장 좌표 복원·초기 복귀는 편집한 상세주소를 덮어쓰지 않는다', async () => {
  const { user, save } = setup(initial);
  fill('상세주소 (선택)', '  새 상세주소  ');
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(save).toHaveBeenLastCalledWith({
    ...initial,
    location: { ...initial.location, detailAddress: '새 상세주소' },
  });
  await user.click(screen.getByRole('button', { name: '마커 조정' }));
  await user.click(screen.getByRole('button', { name: '초기 위치로 되돌리기' }));
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(save).toHaveBeenLastCalledWith({
    ...initial,
    location: { ...initial.location, detailAddress: '새 상세주소' },
  });
});
it('정규 장소 초안을 보존하고 팀 세션에는 장소 입력과 값을 포함하지 않는다', async () => {
  const { user, save } = setup(initial);
  await user.click(screen.getByRole('button', { name: '마커 조정' }));
  await user.click(screen.getByRole('radio', { name: '팀 세션' }));
  expect(screen.queryByLabelText(/장소/)).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(save).toHaveBeenLastCalledWith({
    name: initial.name,
    startDate: initial.startDate,
    endDate: initial.endDate,
    startTime: initial.startTime,
    endTime: initial.endTime,
    type: 'team',
  });
  await user.click(screen.getByRole('radio', { name: '정규 세션' }));
  expect(screen.getByText('36, 128')).toBeInTheDocument();
  expect(screen.getByLabelText('상세주소 (선택)')).toHaveValue('3층');
  await user.click(screen.getByRole('button', { name: '초기 위치로 되돌리기' }));
  expect(screen.getByText('37, 127')).toBeInTheDocument();
});
it('제출 시 필수 입력과 종료 시간을 검증하고 이후 변경 시 오류를 갱신한다', async () => {
  const { user, save } = setup();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByText('세션명을 입력하세요.')).toBeInTheDocument();
  expect(screen.getByText('주소를 선택하고 좌표 조회를 완료해 주세요.')).toBeInTheDocument();
  fill('세션명', '  새 세션  ');
  expect(screen.queryByText('세션명을 입력하세요.')).not.toBeInTheDocument();
  fill('세션 시작일 (한국 시간)', '2020-01-01');
  fill('세션 종료일 (한국 시간)', '2020-01-01');
  fill('시작 시간', '14:00');
  fill('종료 시간', '13:00');
  await user.click(screen.getByRole('radio', { name: '팀 세션' }));
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(screen.getByText('종료 시간은 시작 시간보다 늦어야 합니다.')).toBeInTheDocument();
  fill('종료 시간', '15:00');
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(save).toHaveBeenCalledWith({
    name: '새 세션',
    startDate: '2020-01-01',
    endDate: '2020-01-01',
    startTime: '14:00:00',
    endTime: '15:00:00',
    type: 'team',
  });
});
it('같은 분의 수정 시간을 바꾸지 않으면 초 단위 원본을 보존한다', async () => {
  const sameMinute = {
    name: '같은 분 세션',
    startDate: '2020-01-01',
    endDate: '2020-01-01',
    startTime: '14:00:10',
    endTime: '14:00:30',
    type: 'team',
  } satisfies SessionInput;
  const { user, save } = setup(sameMinute);
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(save).toHaveBeenCalledExactlyOnceWith(sameMinute);
});
it('도로명주소와 상세주소는 각각 255자까지만 허용한다', () => {
  const values = {
    name: '장소 길이 검증',
    startDate: '2020-01-01',
    endDate: '2020-01-01',
    startTime: '13:00',
    endTime: '17:00',
    type: 'regular',
    location: {
      roadAddress: '도'.repeat(255),
      detailAddress: '상'.repeat(255),
      latitude: 0,
      longitude: 0,
    },
  } satisfies SessionFormValues;
  expect(parseSessionForm(values).success).toBe(true);
  expect(
    parseSessionForm({
      ...values,
      location: { ...values.location, roadAddress: '도'.repeat(256) },
    }).success,
  ).toBe(false);
});
it('주소 변경 시 상세주소와 좌표를 비우고 늦은 이전 응답은 무시한다', async () => {
  const old = Promise.withResolvers<Awaited<ReturnType<typeof lookupCoordinates>>>();
  lookup.mockReturnValueOnce(old.promise);
  const { user, save } = setup(initial);
  await user.click(screen.getByRole('button', { name: '주소 A' }));
  expect(screen.getByLabelText('상세주소 (선택)')).toHaveValue('');
  expect(screen.queryByText('37, 127')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: '주소 B' }));
  await screen.findByText('38, 129');
  await act(async () => {
    old.resolve({ status: 'success', data: { latitude: 0, longitude: 0 } });
    await old.promise;
  });
  expect(screen.queryByText('0, 0')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(save).toHaveBeenCalledWith({
    ...initial,
    location: { roadAddress: '주소 B', detailAddress: '', latitude: 38, longitude: 129 },
  });
});
it('좌표 0을 유효한 값으로 저장한다', async () => {
  lookup.mockResolvedValueOnce({ status: 'success', data: { latitude: 0, longitude: 0 } });
  const { user, save } = setup(initial);
  await user.click(screen.getByRole('button', { name: '주소 A' }));
  await screen.findByText('0, 0');
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(save).toHaveBeenCalledWith({
    ...initial,
    location: { roadAddress: '주소 A', detailAddress: '', latitude: 0, longitude: 0 },
  });
});
it('상세주소는 최대 255자로 제한한다', async () => {
  const { user, save } = setup(initial);
  const detailAddress = screen.getByLabelText('상세주소 (선택)');
  expect(detailAddress).toHaveAttribute('maxlength', '255');
  fill('상세주소 (선택)', '가'.repeat(256));
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByText('상세주소는 255자 이하여야 합니다.')).toBeInTheDocument();
});
it('좌표 실패 후 상세주소를 보존하며 재시도하고 같은 주소 재선택은 조정값을 보존한다', async () => {
  lookup.mockRejectedValueOnce(new Error('secret'));
  const { user, save } = setup(initial);
  await user.click(screen.getByRole('button', { name: '주소 A' }));
  await screen.findByText('좌표를 조회하지 못했습니다.');
  fill('상세주소 (선택)', '재시도할 장소');
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(save).not.toHaveBeenCalled();
  expect(screen.queryByText('secret')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '좌표 다시 조회' }));
  await screen.findByText('38, 129');
  await user.click(screen.getByRole('button', { name: '마커 조정' }));
  await user.click(screen.getByRole('button', { name: '주소 A' }));
  expect(screen.getByLabelText('상세주소 (선택)')).toHaveValue('재시도할 장소');
  expect(screen.getByText('36, 128')).toBeInTheDocument();
  expect(lookup).toHaveBeenCalledTimes(2);
});
it('조회 중에도 팀 세션을 저장하고 정규 세션 복귀 시 완료된 좌표를 재사용한다', async () => {
  const pending = Promise.withResolvers<Awaited<ReturnType<typeof lookupCoordinates>>>();
  lookup.mockReturnValueOnce(pending.promise);
  const { user, save } = setup(initial);
  await user.click(screen.getByRole('button', { name: '주소 A' }));
  fill('상세주소 (선택)', '남길 초안');
  await user.click(screen.getByRole('radio', { name: '팀 세션' }));
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(save).toHaveBeenLastCalledWith({
    name: initial.name,
    startDate: initial.startDate,
    endDate: initial.endDate,
    startTime: initial.startTime,
    endTime: initial.endTime,
    type: 'team',
  });
  await act(async () => {
    pending.resolve({ status: 'success', data: { latitude: 38, longitude: 129 } });
    await pending.promise;
  });
  await user.click(screen.getByRole('radio', { name: '정규 세션' }));
  await screen.findByText('38, 129');
  expect(screen.queryByRole('button', { name: '좌표 다시 조회' })).not.toBeInTheDocument();
  expect(screen.getByLabelText('상세주소 (선택)')).toHaveValue('남길 초안');
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(save).toHaveBeenLastCalledWith({
    ...initial,
    location: { roadAddress: '주소 A', detailAddress: '남길 초안', latitude: 38, longitude: 129 },
  });
  expect(lookup).toHaveBeenCalledOnce();
});
it('저장 중 입력·닫기·Esc·중복 제출을 막고 실패 후 재시도한다', async () => {
  const pending = Promise.withResolvers<void>();
  const save = vi
    .fn<(value: SessionInput) => Promise<void>>()
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValue(undefined);
  const { user, close } = setup(initial, save);
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(screen.getByLabelText('세션명')).toBeDisabled();
  expect(screen.getByRole('button', { name: '마커 조정' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '장소 해제' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '닫기' })).toBeDisabled();
  await user.keyboard('{Escape}');
  fireEvent.submit(screen.getByRole('form', { name: '세션 입력' }));
  expect(close).not.toHaveBeenCalled();
  expect(save).toHaveBeenCalledOnce();
  await act(async () => {
    pending.reject(new Error('secret'));
    await expect(pending.promise).rejects.toThrow('secret');
  });
  expect(await screen.findByText(/저장하지 못했습니다/)).toBeInTheDocument();
  expect(screen.getByLabelText('세션명')).toHaveValue('기존 세션');
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(save).toHaveBeenCalledTimes(2);
});
it.each(['취소', '닫기', 'Escape'])(
  '%s 후 다시 열면 초안을 버리고 저장값을 복원한다',
  async (action) => {
    const { user, close } = setup(initial);
    fill('세션명', '버릴 초안');
    if (action === 'Escape') {
      await user.keyboard('{Escape}');
    } else {
      await user.click(screen.getByRole('button', { name: action }));
    }
    expect(close).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: '폼 열기' }));
    expect(screen.getByLabelText('세션명')).toHaveValue('기존 세션');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.getByRole('button', { name: '폼 열기' })).toHaveFocus());
  },
);

it.each(['성공', '실패'])(
  '닫은 폼의 늦은 좌표 %s는 다른 세션의 저장값에 영향을 주지 않는다',
  async (result) => {
    const pending = Promise.withResolvers<Awaited<ReturnType<typeof lookupCoordinates>>>();
    lookup.mockReturnValueOnce(pending.promise);
    const { user, client, save: previousSave } = setup(initial);
    await user.click(screen.getByRole('button', { name: '주소 A' }));
    await user.click(screen.getByRole('button', { name: '취소' }));
    const next: SessionInput = {
      ...initial,
      name: '다른 세션',
      location: { roadAddress: '다른 주소', detailAddress: '', latitude: 35, longitude: 126 },
    };
    const save = vi.fn<(value: SessionInput) => Promise<void>>().mockResolvedValue(undefined);
    render(
      <QueryClientProvider client={client}>
        <SessionForm initialValues={next} onSubmit={save} onClose={() => undefined} />
      </QueryClientProvider>,
    );
    await act(async () => {
      if (result === '성공') {
        pending.resolve({ status: 'success', data: { latitude: 0, longitude: 0 } });
        await pending.promise;
      } else {
        pending.reject(new Error('이전 요청 오류'));
        await pending.promise.catch(() => undefined);
      }
    });
    expect(screen.getByText('35, 126')).toBeVisible();
    expect(screen.queryByText('0, 0')).not.toBeInTheDocument();
    expect(screen.queryByText('좌표를 조회하지 못했습니다.')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '저장' }));
    expect(save).toHaveBeenCalledExactlyOnceWith(next);
    expect(previousSave).not.toHaveBeenCalled();
    expect(lookup).toHaveBeenCalledOnce();
  },
);

it('같은 도로명주소의 다른 건물을 선택하면 상세주소와 조정 좌표를 초기화한다', async () => {
  const { user } = setup(initial);
  await user.click(screen.getByRole('button', { name: '주소 A' }));
  await screen.findByText('38, 129');
  fill('상세주소 (선택)', '이전 건물 3층');
  await user.click(screen.getByRole('button', { name: '마커 조정' }));
  lookup.mockResolvedValueOnce({ status: 'success', data: { latitude: 35, longitude: 128 } });
  await user.click(screen.getByRole('button', { name: '같은 주소의 다른 건물' }));
  await screen.findByText('35, 128');
  expect(screen.getByLabelText('상세주소 (선택)')).toHaveValue('');
  expect(lookup).toHaveBeenCalledTimes(2);
});

it('저장 장소를 해제하면 저장을 막고 폼을 취소했다 다시 열면 저장값을 복원한다', async () => {
  const { user, save } = setup(initial);
  await user.click(screen.getByRole('button', { name: '장소 해제' }));
  expect(screen.queryByText(initial.location.roadAddress)).not.toBeInTheDocument();
  expect(screen.queryByText('37, 127')).not.toBeInTheDocument();
  expect(screen.getByLabelText('상세주소 (선택)')).toHaveValue('');
  expect(screen.getByText('장소 선택을 해제했습니다.')).toBeVisible();
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByText('주소를 선택하고 좌표 조회를 완료해 주세요.')).toBeVisible();
  await user.click(screen.getByRole('button', { name: '취소' }));
  await user.click(screen.getByRole('button', { name: '폼 열기' }));
  expect(screen.getByText(initial.location.roadAddress)).toBeVisible();
  expect(screen.getByLabelText('상세주소 (선택)')).toHaveValue('3층');
});

it.each(['성공', '실패'])('해제한 장소의 늦은 조회 %s를 반영하지 않는다', async (outcome) => {
  const pending = Promise.withResolvers<Awaited<ReturnType<typeof lookupCoordinates>>>();
  lookup.mockReturnValueOnce(pending.promise);
  const { user } = setup();
  await user.click(screen.getByRole('button', { name: '주소 A' }));
  await user.click(screen.getByRole('button', { name: '장소 해제' }));
  await act(async () => {
    if (outcome === '성공') {
      pending.resolve({ status: 'success', data: { latitude: 0, longitude: 0 } });
    } else {
      pending.reject(new Error('늦은 실패'));
    }
    await pending.promise.catch(() => undefined);
  });
  expect(screen.queryByText('0, 0')).not.toBeInTheDocument();
  expect(screen.queryByText('좌표를 조회하지 못했습니다.')).not.toBeInTheDocument();
  expect(screen.queryByText('좌표를 조회하고 있습니다.')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '장소 해제' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '저장' })).toBeEnabled();
});

it('해제 후 같은 건물을 재선택하면 새 조회만 반영한다', async () => {
  const pending = Promise.withResolvers<Awaited<ReturnType<typeof lookupCoordinates>>>();
  lookup.mockReturnValueOnce(pending.promise);
  const { user } = setup(initial);
  await user.click(screen.getByRole('button', { name: '주소 A' }));
  await user.click(screen.getByRole('button', { name: '장소 해제' }));
  await user.click(screen.getByRole('button', { name: '주소 A' }));
  await screen.findByText('38, 129');
  await act(async () => {
    pending.resolve({ status: 'success', data: { latitude: 0, longitude: 0 } });
    await pending.promise;
  });
  expect(screen.queryByText('0, 0')).not.toBeInTheDocument();
  expect(screen.getByText('38, 129')).toBeVisible();
  expect(lookup).toHaveBeenCalledTimes(2);
});

it.each(['성공', '실패'])(
  '좌표 조회 %s 후 해제하면 상세주소·좌표·오류를 비운다',
  async (outcome) => {
    if (outcome === '실패') {
      lookup.mockRejectedValueOnce(new Error('조회 실패'));
    }
    const { user } = setup(initial);
    await user.click(screen.getByRole('button', { name: '주소 A' }));
    await screen.findByText(outcome === '성공' ? '38, 129' : '좌표를 조회하지 못했습니다.');
    fill('상세주소 (선택)', '비울 상세주소');
    await user.click(screen.getByRole('button', { name: '장소 해제' }));
    expect(screen.getByLabelText('상세주소 (선택)')).toHaveValue('');
    expect(screen.getByLabelText('세션명')).toHaveValue(initial.name);
    expect(screen.queryByRole('region', { name: '선택한 장소' })).not.toBeInTheDocument();
    expect(screen.queryByText('38, 129')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '좌표 다시 조회' })).not.toBeInTheDocument();
    expect(screen.queryByText('좌표를 조회하지 못했습니다.')).not.toBeInTheDocument();
  },
);

it('건물 관리번호가 없는 저장 주소를 검색에서 다시 선택하면 새 건물로 조회한다', async () => {
  const { user } = setup({ ...initial, location: { ...initial.location, roadAddress: '주소 A' } });
  expect(screen.getByText('37, 127')).toBeVisible();
  await user.click(screen.getByRole('button', { name: '주소 A' }));
  await screen.findByText('38, 129');
  expect(screen.getByLabelText('상세주소 (선택)')).toHaveValue('');
  expect(lookup).toHaveBeenCalledOnce();
});
