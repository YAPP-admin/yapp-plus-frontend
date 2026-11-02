/** 마커 드래그·초기 복귀와 읽기 전용 좌표 표시를 검증합니다. */
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useEffect, useState, type ReactNode } from 'react';
import { useKakaoLoader } from 'react-kakao-maps-sdk';
import { SessionLocationMap } from './session-location-map';

type ResizeMap = Pick<kakao.maps.Map, 'getNode' | 'relayout' | 'setCenter'>;
const { mapInstance } = vi.hoisted(() => ({
  mapInstance: {
    getNode: vi.fn<ResizeMap['getNode']>(),
    relayout: vi.fn<ResizeMap['relayout']>(),
    setCenter: vi.fn<ResizeMap['setCenter']>(),
  },
}));
let notifyResize: (() => void) | undefined;
const disconnectResize = vi.fn<() => void>();
const observeResize = vi.fn<(node: Element) => void>();

vi.mock('react-kakao-maps-sdk', () => ({
  useKakaoLoader: vi.fn<typeof useKakaoLoader>(),
  Map: ({
    children,
    onClick,
    onCreate,
  }: {
    children: ReactNode;
    onCreate?: (map: ResizeMap) => void;
    onClick?: (
      map: null,
      event: { latLng: { getLat: () => number; getLng: () => number } },
    ) => void;
  }) => {
    useEffect(() => {
      onCreate?.(mapInstance);
    }, [onCreate]);
    return (
      <div>
        <button
          type="button"
          onClick={() => onClick?.(null, { latLng: { getLat: () => 37.5, getLng: () => 127.1 } })}
        >
          지도 클릭
        </button>
        {children}
      </div>
    );
  },
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
  function Harness() {
    const [position, setPosition] = useState(initialPosition);
    return (
      <SessionLocationMap
        initialPosition={initialPosition}
        position={position}
        onChange={(value) => {
          setPosition(value);
          onChange(value);
        }}
        disabled={disabled}
      />
    );
  }
  render(<Harness />);
  return onChange;
}
beforeEach(() => {
  vi.stubEnv('VITE_KAKAO_MAP_JS_KEY', 'test-map-key');
  mapInstance.getNode.mockReturnValue(document.createElement('div'));
  mapInstance.relayout.mockClear();
  mapInstance.setCenter.mockClear();
  notifyResize = undefined;
  disconnectResize.mockClear();
  observeResize.mockClear();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      private isMap = false;
      constructor(private callback: () => void) {}
      observe(node: Element) {
        if (node === mapInstance.getNode()) {
          this.isMap = true;
          notifyResize = this.callback;
          observeResize(node);
        }
      }
      unobserve() {
        return undefined;
      }
      disconnect() {
        if (this.isMap) {
          disconnectResize();
        }
      }
    },
  );
  vi.stubGlobal('kakao', {
    maps: {
      LatLng: class {
        constructor(
          public latitude: number,
          public longitude: number,
        ) {}
        getLat() {
          return this.latitude;
        }
        getLng() {
          return this.longitude;
        }
      },
    },
  });
  load.mockReturnValue([false, undefined]);
});
afterEach(() => {
  load.mockReset();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
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

it('지도 로딩 완료가 저장된 조정 좌표를 초기 위치로 되돌리지 않는다', () => {
  load.mockReturnValue([true, undefined]);
  const onChange = vi.fn<(value: { latitude: number; longitude: number }) => void>();
  const position = { latitude: 36, longitude: 128 };
  const view = render(
    <SessionLocationMap
      initialPosition={initialPosition}
      position={position}
      onChange={onChange}
    />,
  );
  expect(screen.getByText('36.0000000')).toBeVisible();
  load.mockReturnValue([false, undefined]);
  view.rerender(
    <SessionLocationMap
      initialPosition={initialPosition}
      position={{ ...position }}
      onChange={onChange}
    />,
  );
  expect(screen.getByRole('button', { name: '마커 드래그' })).toBeEnabled();
  expect(screen.getByText('36.0000000')).toBeVisible();
  expect(screen.getByText('128.0000000')).toBeVisible();
  expect(onChange).not.toHaveBeenCalled();
});

it('컨테이너 크기 변경 후 현재 조정 좌표를 중심으로 복원하고 저장값은 변경하지 않는다', () => {
  const onChange = setup();
  expect(observeResize).toHaveBeenCalledWith(mapInstance.getNode());
  fireEvent.click(screen.getByRole('button', { name: '마커 드래그' }));
  onChange.mockClear();
  notifyResize?.();
  expect(mapInstance.relayout).toHaveBeenCalledOnce();
  const center = mapInstance.setCenter.mock.lastCall?.[0];
  expect(center && 'getLat' in center ? center.getLat() : undefined).toBe(37.6);
  expect(center && 'getLng' in center ? center.getLng() : undefined).toBe(127.2);
  expect(mapInstance.relayout.mock.invocationCallOrder[0]).toBeLessThan(
    mapInstance.setCenter.mock.invocationCallOrder[0] ?? 0,
  );
  notifyResize?.();
  expect(mapInstance.relayout).toHaveBeenCalledTimes(2);
  expect(onChange).not.toHaveBeenCalled();
});

it('SDK 로딩 중에는 관찰하지 않고 완료 후 연결하며 닫을 때 해제한다', () => {
  load.mockReturnValue([true, undefined]);
  const props = {
    initialPosition,
    position: initialPosition,
    onChange: vi.fn<(value: typeof initialPosition) => void>(),
  };
  const view = render(<SessionLocationMap {...props} />);
  expect(observeResize).not.toHaveBeenCalled();
  load.mockReturnValue([false, undefined]);
  view.rerender(<SessionLocationMap {...props} position={{ ...initialPosition }} />);
  expect(observeResize).toHaveBeenCalledOnce();
  notifyResize?.();
  expect(mapInstance.relayout).toHaveBeenCalledOnce();
  view.unmount();
  expect(disconnectResize).toHaveBeenCalledOnce();
  notifyResize?.();
  expect(mapInstance.relayout).toHaveBeenCalledOnce();
});
