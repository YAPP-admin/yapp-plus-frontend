/** 마커 드래그·초기 복귀와 읽기 전용 좌표 표시를 검증합니다. */
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { useKakaoLoader } from 'react-kakao-maps-sdk';
import { SessionLocationMap } from './session-location-map';

vi.mock('react-kakao-maps-sdk', () => ({
  useKakaoLoader: vi.fn<typeof useKakaoLoader>(),
  Map: ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick?: (
      map: null,
      event: { latLng: { getLat: () => number; getLng: () => number } },
    ) => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={() => onClick?.(null, { latLng: { getLat: () => 37.5, getLng: () => 127.1 } })}
      >
        지도 클릭
      </button>
      {children}
    </div>
  ),
  MapMarker: ({
    onDragEnd,
    draggable,
  }: {
    onDragEnd: (marker: {
      getPosition: () => { getLat: () => number; getLng: () => number };
    }) => void;
    draggable: boolean;
  }) => (
    <button
      type="button"
      disabled={!draggable}
      onClick={() =>
        onDragEnd({ getPosition: () => ({ getLat: () => 37.6, getLng: () => 127.2 }) })
      }
    >
      마커 드래그
    </button>
  ),
}));
const load = vi.mocked(useKakaoLoader);
const initialPosition = { latitude: 37.5665, longitude: 126.978 };
function setup(disabled = false) {
  const onChange = vi.fn<(value: { latitude: number; longitude: number }) => void>();
  render(
    <SessionLocationMap
      initialPosition={initialPosition}
      onChange={onChange}
      disabled={disabled}
    />,
  );
  return onChange;
}
beforeEach(() => {
  vi.stubEnv('VITE_KAKAO_MAP_JS_KEY', 'test-map-key');
  load.mockReturnValue([false, undefined]);
});
afterEach(() => {
  load.mockReset();
  vi.unstubAllEnvs();
});

it('마커 드래그와 초기 복귀가 읽기 전용 좌표를 갱신한다', () => {
  const onChange = setup();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.getByText('37.5665000')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '마커 드래그' }));
  expect(onChange).toHaveBeenLastCalledWith({ latitude: 37.6, longitude: 127.2 });
  expect(screen.getByText('37.6000000')).toBeInTheDocument();
  expect(screen.getByText('127.2000000')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '초기 위치로 되돌리기' }));
  expect(onChange).toHaveBeenLastCalledWith(initialPosition);
  expect(screen.getByText('37.5665000')).toBeInTheDocument();
  expect(screen.getByText('126.9780000')).toBeInTheDocument();
});
it('지도 클릭은 좌표를 변경하지 않는다', () => {
  const onChange = setup();
  fireEvent.click(screen.getByRole('button', { name: '지도 클릭' }));
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByText('37.5665000')).toBeInTheDocument();
});
it('지도 실패는 새로고침을 안내하고 현재 좌표를 유지한다', () => {
  load.mockReturnValue([false, new ErrorEvent('error', { message: 'secret' })]);
  const onChange = setup();
  expect(screen.queryByText(/secret/)).not.toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('새로고침');
  expect(screen.getByText('37.5665000')).toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});
it('비활성화 상태에서는 드래그와 초기 복귀를 막는다', () => {
  const onChange = setup(true);
  const marker = screen.getByRole('button', { name: '마커 드래그' });
  const reset = screen.getByRole('button', { name: '초기 위치로 되돌리기' });
  expect(marker).toBeDisabled();
  expect(reset).toBeDisabled();
  fireEvent.click(marker);
  fireEvent.click(reset);
  expect(onChange).not.toHaveBeenCalled();
});
it('지도 로딩 중에도 현재 좌표를 표시한다', () => {
  load.mockReturnValue([true, undefined]);
  const onChange = setup();
  expect(screen.getByText('지도를 불러오고 있습니다.')).toBeInTheDocument();
  expect(screen.getByText('37.5665000')).toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});
it('키 누락 시 SDK를 요청하지 않고 현재 좌표를 표시한다', () => {
  vi.stubEnv('VITE_KAKAO_MAP_JS_KEY', '');
  setup();
  expect(load).not.toHaveBeenCalled();
  expect(screen.getByRole('alert')).toHaveTextContent('지도 설정');
  expect(screen.getByText('37.5665000')).toBeInTheDocument();
});
