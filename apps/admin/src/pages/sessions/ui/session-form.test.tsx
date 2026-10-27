/** 공통 폼의 저장 계약·유형별 초안·비동기 조회·닫기 차단을 검증합니다. */
import { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createAdminQueryClient } from '../../../query-client';
import type { CreateSessionInput } from '../model/session';
import { lookupCoordinates } from '../model/location/coordinates';
import type {
  AddressSearchItemViewModel,
  CoordinatesViewModel,
} from '../model/location/location-view-model';
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
      {['주소 A', '주소 B'].map((roadAddress) => (
        <button
          key={roadAddress}
          type="button"
          disabled={disabled}
          onClick={() =>
            onSelect({
              roadAddress,
              lookupReference: {
                administrativeAreaCode: roadAddress,
                roadNameManagementNumber: '1',
                isUnderground: false,
                buildingMainNumber: '1',
                buildingSubNumber: '0',
                buildingManagementNumber: roadAddress,
              },
            })
          }
        >
          {roadAddress}
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
const initial: CreateSessionInput = {
  name: '기존 세션',
  date: '2020-01-01',
  startTime: '13:00',
  endTime: '17:00',
  type: 'offline',
  location: { roadAddress: '저장된 주소', detailAddress: '3층', latitude: 37, longitude: 127 },
};
function setup(
  initialValues?: CreateSessionInput,
  save = vi.fn<(value: CreateSessionInput) => Promise<void>>().mockResolvedValue(undefined),
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
  return { user: userEvent.setup(), save, close };
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
it('유형별 초안을 보존하고 현재 유형의 값만 저장한다', async () => {
  const { user, save } = setup(initial);
  await user.click(screen.getByRole('button', { name: '마커 조정' }));
  await user.click(screen.getByRole('radio', { name: '팀 세션' }));
  fill('장소 안내 (선택)', '  팀별 회의  ');
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(save).toHaveBeenLastCalledWith({
    ...initial,
    type: 'team',
    location: { guide: '팀별 회의' },
  });
  await user.click(screen.getByRole('radio', { name: '오프라인' }));
  expect(screen.getByText('36, 128')).toBeInTheDocument();
  expect(screen.getByLabelText('상세주소 (선택)')).toHaveValue('3층');
  await user.click(screen.getByRole('button', { name: '초기 위치로 되돌리기' }));
  expect(screen.getByText('37, 127')).toBeInTheDocument();
  await user.click(screen.getByRole('radio', { name: '팀 세션' }));
  expect(screen.getByLabelText('장소 안내 (선택)')).toHaveValue('  팀별 회의  ');
});
it('제출 시 필수 입력과 종료 시간을 검증하고 이후 변경 시 오류를 갱신한다', async () => {
  const { user, save } = setup();
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByText('세션명을 입력하세요.')).toBeInTheDocument();
  expect(screen.getByText('주소를 선택하고 좌표 조회를 완료해 주세요.')).toBeInTheDocument();
  fill('세션명', '  새 세션  ');
  expect(screen.queryByText('세션명을 입력하세요.')).not.toBeInTheDocument();
  fill('날짜 (한국 시간)', '2020-01-01');
  fill('시작 시간', '14:00');
  fill('종료 시간', '13:00');
  await user.click(screen.getByRole('radio', { name: '팀 세션' }));
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(screen.getByText('종료 시간은 시작 시간보다 늦어야 합니다.')).toBeInTheDocument();
  fill('종료 시간', '15:00');
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(save).toHaveBeenCalledWith({
    name: '새 세션',
    date: '2020-01-01',
    startTime: '14:00',
    endTime: '15:00',
    type: 'team',
    location: { guide: '' },
  });
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
it('조회 중에도 팀 세션을 저장하고 오프라인 복귀 시 완료된 좌표를 재사용한다', async () => {
  const pending = Promise.withResolvers<Awaited<ReturnType<typeof lookupCoordinates>>>();
  lookup.mockReturnValueOnce(pending.promise);
  const { user, save } = setup(initial);
  await user.click(screen.getByRole('button', { name: '주소 A' }));
  fill('상세주소 (선택)', '남길 초안');
  await user.click(screen.getByRole('radio', { name: '팀 세션' }));
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(save).toHaveBeenLastCalledWith({ ...initial, type: 'team', location: { guide: '' } });
  await act(async () => {
    pending.resolve({ status: 'success', data: { latitude: 38, longitude: 129 } });
    await pending.promise;
  });
  await user.click(screen.getByRole('radio', { name: '오프라인' }));
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
    .fn<(value: CreateSessionInput) => Promise<void>>()
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValue(undefined);
  const { user, close } = setup(initial, save);
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(screen.getByLabelText('세션명')).toBeDisabled();
  expect(screen.getByRole('button', { name: '마커 조정' })).toBeDisabled();
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
