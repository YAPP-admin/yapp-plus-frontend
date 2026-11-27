/** 브리지 결과가 설정 화면의 선택·권한·복구 행동으로 연결되는 사용자 흐름을 검증합니다. */
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NotificationSettingsResult } from '@yapp-plus/app-bridge';
import {
  getNotificationSettings,
  setNotificationEnabled,
  openAppSettings,
} from '@yapp-plus/app-bridge/web';
import { NotificationSetting } from './notification-setting';

const activity = vi.hoisted(() => ({ isActive: true }));
vi.mock('@stackflow/react', () => ({ useActivity: () => activity }));
vi.mock('@yapp-plus/app-bridge/web', () => ({
  getNotificationSettings: vi.fn<typeof getNotificationSettings>(),
  setNotificationEnabled: vi.fn<typeof setNotificationEnabled>(),
  openAppSettings: vi.fn<typeof openAppSettings>(),
}));
function deferred() {
  const resolver = { resolve: (_value: NotificationSettingsResult): void => {} };
  const promise = new Promise<NotificationSettingsResult>((resolve) => {
    resolver.resolve = resolve;
  });
  return { promise, resolve: (value: NotificationSettingsResult) => resolver.resolve(value) };
}
const allowed = (enabled: boolean): NotificationSettingsResult => ({
  status: 'SUCCESS',
  enabled,
  permission: 'authorized',
});
function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = () => (
    <QueryClientProvider client={client}>
      <NotificationSetting />
    </QueryClientProvider>
  );
  const rendered = render(view());
  return { client, user: userEvent.setup(), rerender: () => rendered.rerender(view()) };
}
beforeEach(() => {
  vi.resetAllMocks();
  activity.isActive = true;
  vi.mocked(getNotificationSettings).mockResolvedValue(allowed(true));
});
afterEach(() => {
  focusManager.setFocused(undefined);
});

describe('알림 설정', () => {
  it('최초 조회 중에는 설명 없이 스위치를 비활성화하고 완료 후 선택을 표시한다', async () => {
    const result = deferred();
    vi.mocked(getNotificationSettings).mockReturnValue(result.promise);
    setup();
    expect(screen.getByRole('switch')).toBeDisabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    await act(async () => {
      result.resolve(allowed(true));
      await result.promise;
    });
    await waitFor(() => expect(screen.getByRole('switch')).toBeEnabled());
    expect(screen.getByRole('switch')).toBeChecked();
    expect(screen.getByRole('switch')).not.toHaveAttribute('aria-describedby');
  });

  it('미지원 앱에서는 안내 문구 없이 스위치를 비활성화한다', async () => {
    vi.mocked(getNotificationSettings).mockResolvedValue({
      status: 'ERROR',
      code: 'UNSUPPORTED',
      retryable: false,
    });
    setup();
    await waitFor(() =>
      expect(screen.queryByText('알림 설정을 불러오고 있어요.')).not.toBeInTheDocument(),
    );
    expect(screen.queryByText('알림 설정은 최신 앱에서 사용할 수 있어요.')).not.toBeInTheDocument();
    expect(screen.getByRole('switch', { name: '알림' })).toBeDisabled();
  });

  it('일반 조회 실패는 설정 항목을 공통 오류 UI로 교체하고 수동 재시도로 복구한다', async () => {
    vi.mocked(getNotificationSettings).mockResolvedValueOnce({
      status: 'ERROR',
      code: 'NETWORK',
      retryable: true,
    });
    const { user } = setup();
    expect(
      await screen.findByRole('heading', { name: '알림 설정을 불러오지 못했어요' }),
    ).toBeVisible();
    expect(screen.queryByRole('switch', { name: '알림' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '알림 설정 다시 불러오기' }));
    await waitFor(() => expect(screen.getByRole('switch', { name: '알림' })).toBeChecked());
  });

  it('성공한 선택의 재조회 실패도 이전 선택과 공존하지 않는다', async () => {
    const { user } = setup();
    await waitFor(() => expect(screen.getByRole('switch', { name: '알림' })).toBeChecked());
    vi.mocked(getNotificationSettings).mockResolvedValue({
      status: 'ERROR',
      code: 'NETWORK',
      retryable: true,
    });

    act(() => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
    });

    expect(
      await screen.findByRole('heading', { name: '알림 설정을 불러오지 못했어요' }),
    ).toBeVisible();
    expect(screen.queryByRole('switch', { name: '알림' })).not.toBeInTheDocument();
    vi.mocked(getNotificationSettings).mockResolvedValue(allowed(false));
    await user.click(screen.getByRole('button', { name: '알림 설정 다시 불러오기' }));
    await waitFor(() => expect(screen.getByRole('switch', { name: '알림' })).not.toBeChecked());
  });

  it('변경 중 이전 선택을 유지하고 실패 후 같은 선택을 재시도한다', async () => {
    const { user } = setup();
    await waitFor(() => expect(screen.getByRole('switch')).toBeChecked());
    vi.mocked(setNotificationEnabled).mockResolvedValueOnce({
      status: 'ERROR',
      code: 'SERVER',
      retryable: true,
    });
    await user.click(screen.getByRole('switch'));
    expect(await screen.findByRole('button', { name: '알림 변경 다시 시도' })).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeChecked();
    expect(screen.getByRole('switch')).toHaveAccessibleDescription(
      '변경하지 못했어요. 다시 시도해 주세요.',
    );
    vi.mocked(setNotificationEnabled).mockResolvedValue(allowed(false));
    vi.mocked(getNotificationSettings).mockResolvedValue(allowed(false));
    await user.click(screen.getByRole('button', { name: '알림 변경 다시 시도' }));
    await waitFor(() => expect(screen.getByRole('switch')).not.toBeChecked());
    expect(setNotificationEnabled).toHaveBeenLastCalledWith({ enabled: false });
  });

  it('키보드 변경을 한 번만 보내고 완료까지 중복 입력을 막는다', async () => {
    const { user } = setup();
    await waitFor(() => expect(screen.getByRole('switch')).toBeChecked());
    const result = deferred();
    vi.mocked(setNotificationEnabled).mockReturnValue(result.promise);
    await user.tab();
    await user.keyboard(' ');
    expect(screen.getByRole('switch')).toBeDisabled();
    expect(screen.getByRole('switch')).toBeChecked();
    expect(setNotificationEnabled).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    vi.mocked(getNotificationSettings).mockResolvedValue(allowed(false));
    await act(async () => {
      result.resolve(allowed(false));
      await result.promise;
    });
    await waitFor(() => expect(screen.getByRole('switch')).not.toBeChecked());
  });

  it('저장된 ON과 거부된 OS 권한을 구분하고 복귀 때 재조회한다', async () => {
    vi.mocked(getNotificationSettings).mockResolvedValue({
      status: 'SUCCESS',
      enabled: true,
      permission: 'denied',
    });
    vi.mocked(openAppSettings).mockResolvedValue({ status: 'SUCCESS' });
    const { user } = setup();
    await user.click(await screen.findByRole('button', { name: '시스템 설정 열기' }));
    expect(openAppSettings).toHaveBeenCalledOnce();
    expect(screen.getByRole('switch')).toBeChecked();
    expect(screen.getByRole('switch')).toHaveAccessibleDescription(
      '시스템에서 알림이 꺼져 있어요. 시스템 설정에서 허용해 주세요.',
    );
    vi.mocked(getNotificationSettings).mockResolvedValue(allowed(true));
    act(() => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
    });
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: '시스템 설정 열기' })).not.toBeInTheDocument(),
    );
  });

  it('설정 실행 성공은 변경 실패를 지우지 않고 권한 안내는 복귀 조회로 갱신한다', async () => {
    vi.mocked(getNotificationSettings).mockResolvedValue({
      status: 'SUCCESS',
      enabled: false,
      permission: 'denied',
    });
    vi.mocked(setNotificationEnabled).mockResolvedValue({
      status: 'ERROR',
      code: 'SERVER',
      retryable: true,
    });
    vi.mocked(openAppSettings).mockResolvedValue({ status: 'SUCCESS' });
    const { user } = setup();
    await screen.findByRole('button', { name: '시스템 설정 열기' });
    await user.click(screen.getByRole('switch'));
    await screen.findByRole('button', { name: '알림 변경 다시 시도' });
    await user.click(screen.getByRole('button', { name: '시스템 설정 열기' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '시스템 설정 열기' })).toBeEnabled(),
    );
    expect(screen.getByRole('button', { name: '알림 변경 다시 시도' })).toBeInTheDocument();
    vi.mocked(setNotificationEnabled).mockResolvedValue({
      status: 'ERROR',
      code: 'PERMISSION_REQUIRED',
      retryable: false,
    });
    await user.click(screen.getByRole('button', { name: '알림 변경 다시 시도' }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: '알림 변경 다시 시도' })).not.toBeInTheDocument(),
    );
    vi.mocked(getNotificationSettings).mockResolvedValue(allowed(false));
    act(() => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
    });
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: '시스템 설정 열기' })).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('switch')).not.toBeChecked();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('switch')).not.toHaveAttribute('aria-describedby');
  });

  it('다른 화면에서 설정으로 돌아오면 다시 조회한다', async () => {
    const { rerender } = setup();
    await waitFor(() => expect(screen.getByRole('switch')).toBeChecked());
    activity.isActive = false;
    rerender();
    vi.mocked(getNotificationSettings).mockResolvedValue(allowed(false));
    activity.isActive = true;
    rerender();
    await waitFor(() => expect(screen.getByRole('switch')).not.toBeChecked());
  });

  it('계정 경계에서 제거한 캐시를 늦은 변경 응답이 복원하지 않는다', async () => {
    const { user, client } = setup();
    await waitFor(() => expect(screen.getByRole('switch')).toBeChecked());
    const result = deferred();
    vi.mocked(setNotificationEnabled).mockReturnValue(result.promise);
    await user.click(screen.getByRole('switch'));
    activity.isActive = false;
    act(() => client.removeQueries({ queryKey: ['notification-settings'] }));
    await act(async () => {
      result.resolve(allowed(false));
      await result.promise;
    });
    expect(client.getQueryData(['notification-settings', undefined, undefined])).toBeUndefined();
  });
});
