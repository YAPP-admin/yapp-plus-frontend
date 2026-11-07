/** 개발 도구의 사용자 흐름과 화면 수명을 검증한다. 테스트 위치는 합성 값만 사용한다. */

import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  LocationResult,
  LocationPermissionResult,
  OpenAppSettingsResult,
} from '@yapp-plus/app-bridge';
import { LocationCheck } from './location-check';
import { DevRoutesPage } from './dev-routes-page';

const bridge = vi.hoisted(() => ({
  isNativeLocationEnvironment: vi.fn<() => boolean>(),
  requestCurrentLocation: vi.fn<() => Promise<LocationResult>>(),
  getLocationPermission: vi.fn<() => Promise<LocationPermissionResult>>(),
  openAppSettings: vi.fn<() => Promise<OpenAppSettingsResult>>(),
}));
vi.mock('@yapp-plus/app-bridge/web', () => bridge);

const sample: LocationResult = {
  status: 'SUCCESS',
  location: {
    latitude: 37.123456,
    longitude: 127.654321,
    accuracy: 200,
    timestamp: 123456789,
    precision: 'approximate',
  },
};
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((yes) => {
    resolve = yes;
  });
  return { promise, resolve };
};
const setup = (active?: boolean) => {
  const client = new QueryClient();
  const view = (isActive?: boolean) => (
    <QueryClientProvider client={client}>
      {isActive === undefined ? <LocationCheck /> : <DevRoutesPage isActive={isActive} />}
    </QueryClientProvider>
  );
  const result = render(view(active));
  return { ...result, client, setActive: (isActive: boolean) => result.rerender(view(isActive)) };
};

beforeEach(() => {
  vi.resetAllMocks();
  bridge.isNativeLocationEnvironment.mockReturnValue(true);
  bridge.requestCurrentLocation.mockResolvedValue(sample);
  bridge.openAppSettings.mockResolvedValue({ status: 'SUCCESS' });
});
afterEach(() => {
  onlineManager.setOnline(true);
});

describe('위치 개발 도구', () => {
  it('일반 브라우저에서 안내하고 모든 요청을 막는다', async () => {
    bridge.isNativeLocationEnvironment.mockReturnValue(false);
    setup();
    expect(screen.getByText('YAPP+ 앱에서 이용해 주세요.')).toBeVisible();
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
    await userEvent.setup().click(screen.getByRole('button', { name: '현재 위치 요청' }));
    expect(bridge.requestCurrentLocation).not.toHaveBeenCalled();
  });

  it('요청 중 중복 클릭을 막고 좌표를 DOM·Query 캐시에 남기지 않는다', async () => {
    const pending = deferred<LocationResult>();
    bridge.requestCurrentLocation.mockReturnValue(pending.promise);
    const { client, container } = setup();
    const user = userEvent.setup();
    await user.dblClick(screen.getByRole('button', { name: '현재 위치 요청' }));
    expect(bridge.requestCurrentLocation).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('요청 처리 중');
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
    await act(async () => {
      pending.resolve(sample);
      await pending.promise;
    });
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('위치 수신 성공'));
    expect(screen.getByRole('status')).toHaveTextContent('대략적인 위치');
    for (const value of ['37.123456', '127.654321', '123456789']) {
      expect(container.textContent).not.toContain(value);
      expect(
        JSON.stringify(
          client
            .getMutationCache()
            .getAll()
            .map((m) => m.state),
        ),
      ).not.toContain(value);
    }
  });

  it('화면 이탈 뒤 늦은 응답을 버리고 재진입하면 새 요청을 시작한다', async () => {
    const pending = deferred<LocationResult>();
    bridge.requestCurrentLocation.mockReturnValueOnce(pending.promise);
    const h = setup(true);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: '현재 위치 요청' }));
    h.setActive(false);
    expect(screen.queryByRole('button', { name: '현재 위치 요청' })).not.toBeInTheDocument();
    h.setActive(true);
    await screen.findByRole('button', { name: '현재 위치 요청' });
    await act(async () => {
      pending.resolve(sample);
      await pending.promise;
    });
    expect(screen.getByRole('status')).toHaveTextContent('아직 요청하지 않았습니다.');
    await user.click(screen.getByRole('button', { name: '현재 위치 요청' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('위치 수신 성공'));
    expect(bridge.requestCurrentLocation).toHaveBeenCalledTimes(2);
  });

  it('거부 후 설정을 열어도 자동 재요청하지 않고 사용자가 권한을 재조회한다', async () => {
    bridge.requestCurrentLocation.mockResolvedValue({
      status: 'ERROR',
      code: 'PERMISSION_DENIED',
      canAskAgain: false,
    });
    bridge.getLocationPermission.mockResolvedValue({
      status: 'SUCCESS',
      permission: {
        status: 'granted',
        canAskAgain: true,
        precision: 'precise',
        servicesEnabled: true,
      },
    });
    setup();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '현재 위치 요청' }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('앱 설정에서 위치 권한'),
    );
    await user.click(screen.getByRole('button', { name: '앱 설정 열기' }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('돌아온 뒤 권한을 다시 조회'),
    );
    expect(bridge.requestCurrentLocation).toHaveBeenCalledTimes(1);
    expect(bridge.getLocationPermission).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '권한 조회' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('권한: 허용'));
  });

  it('오프라인에서도 로컬 위치 요청을 실행하며 실패를 자동 재시도하지 않는다', async () => {
    onlineManager.setOnline(false);
    bridge.requestCurrentLocation.mockResolvedValue({ status: 'ERROR', code: 'TIMEOUT' });
    setup();
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole('button', { name: '권한 조회' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: '현재 위치 요청' }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('대기 시간이 지났습니다'),
    );
    expect(bridge.requestCurrentLocation).toHaveBeenCalledTimes(1);
  });
});
