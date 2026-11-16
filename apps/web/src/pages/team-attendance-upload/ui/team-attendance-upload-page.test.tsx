/** 화면의 사진 수명·취소·권한 안내를 검증하며 브리지 내부 스키마 동작은 반복하지 않는다. */
import userEvent from '@testing-library/user-event';
import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pickAttendancePhoto } from '@yapp-plus/app-bridge/web';
import type { PickAttendancePhotoResult } from '@yapp-plus/app-bridge';
import { ScreenActiveContext } from '@/shared/lib/screen-activity';
import { TeamAttendanceUploadPage } from './team-attendance-upload-page';

const auth = vi.hoisted(() => ({ isNative: true, phase: 'SIGNED_IN', session: { userId: 1 } }));
vi.mock('@/features/auth', () => ({ useNativeAuthSession: () => auth }));
vi.mock('@yapp-plus/app-bridge/web', () => ({
  pickAttendancePhoto: vi.fn<typeof pickAttendancePhoto>(),
}));
vi.mock('@stackflow/react', () => ({
  useActivity: () => ({ isRoot: true }),
  useFlow: () => ({ replace: vi.fn<() => void>(), pop: vi.fn<() => void>() }),
}));
const success: PickAttendancePhotoResult = {
  status: 'SUCCESS',
  photo: {
    filename: 'team-attendance.jpg',
    contentType: 'image/jpeg',
    sizeBytes: 3,
    width: 1,
    height: 1,
    base64: 'YWJj',
  },
};
const revoke = vi.fn<(url: string) => void>();
let urlIndex = 0;
const createUrl = vi.fn<() => string>(() => `blob:photo-${++urlIndex}`);
function setup() {
  const client = new QueryClient();
  const view = (active = true) => (
    <QueryClientProvider client={client}>
      <ScreenActiveContext value={active}>
        <TeamAttendanceUploadPage />
      </ScreenActiveContext>
    </QueryClientProvider>
  );
  return { ...render(view()), client, view, user: userEvent.setup() };
}

beforeEach(() => {
  vi.clearAllMocks();
  auth.isNative = true;
  auth.session.userId = 1;
  vi.spyOn(URL, 'createObjectURL').mockImplementation(createUrl);
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(revoke);
  vi.mocked(pickAttendancePhoto).mockResolvedValue(success);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('개발 사진 입력', () => {
  it('키보드로 사진을 선택하고 교체·이탈 때 URL을 해제하며 캐시에 바이트를 남기지 않는다', async () => {
    const { user, unmount, client } = setup();
    const select = screen.getByRole('button', { name: '인증 사진 선택' });
    select.focus();
    await user.keyboard('{Enter}');
    const preview = await screen.findByAltText('선택한 팀 인증 사진');
    const firstUrl = preview.getAttribute('src');
    expect(pickAttendancePhoto).toHaveBeenCalledWith({ source: 'library' });
    expect(screen.getByRole('button', { name: '제출 기능 준비 중' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: '인증 사진 바꾸기' }));
    await waitFor(() => expect(revoke).toHaveBeenCalledWith(firstUrl));
    for (const mutation of client.getMutationCache().getAll()) {
      expect(mutation.state.variables).toBe('library');
      expect(mutation.state.data).toBeUndefined();
    }
    const lastUrl = preview.getAttribute('src');
    unmount();
    expect(revoke).toHaveBeenCalledWith(lastUrl);
  });

  it('취소·권한 거부에는 기존 사진을 유지하고 재요청 불가 시 기기 설정을 안내한다', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: '인증 사진 선택' }));
    const firstUrl = (await screen.findByAltText('선택한 팀 인증 사진')).getAttribute('src');
    vi.mocked(pickAttendancePhoto).mockResolvedValueOnce({ status: 'CANCELLED' });
    await user.click(screen.getByRole('button', { name: '인증 사진 바꾸기' }));
    vi.mocked(pickAttendancePhoto).mockResolvedValueOnce({
      status: 'ERROR',
      code: 'PERMISSION_DENIED',
      canAskAgain: false,
    });
    await user.click(screen.getByRole('button', { name: '사진 촬영하기' }));
    expect(pickAttendancePhoto).toHaveBeenLastCalledWith({ source: 'camera' });
    expect(await screen.findByRole('status')).toHaveTextContent('기기 설정에서 카메라 접근');
    expect(screen.getByAltText('선택한 팀 인증 사진')).toHaveAttribute('src', firstUrl);
    expect(revoke).not.toHaveBeenCalled();
  });

  it('준비 중 중복 입력을 막고 이탈 뒤 돌아와도 늦은 결과를 표시하지 않는다', async () => {
    let resolve: ((value: PickAttendancePhotoResult) => void) | undefined;
    vi.mocked(pickAttendancePhoto).mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const { user, rerender, view } = setup();
    await user.click(screen.getByRole('button', { name: '사진 촬영하기' }));
    expect(screen.getByRole('button', { name: '인증 사진 선택' })).toBeDisabled();
    expect(screen.getByRole('progressbar', { name: '사진 준비 중' })).toBeInTheDocument();
    rerender(view(false));
    rerender(view(true));
    act(() => resolve?.(success));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '인증 사진 선택' })).toBeEnabled(),
    );
    expect(screen.queryByAltText('선택한 팀 인증 사진')).not.toBeInTheDocument();
    expect(createUrl).not.toHaveBeenCalled();
  });

  it('계정 변경 시 기존 사진을 폐기한다', async () => {
    const { user, rerender, view } = setup();
    await user.click(screen.getByRole('button', { name: '인증 사진 선택' }));
    const url = (await screen.findByAltText('선택한 팀 인증 사진')).getAttribute('src');
    auth.session.userId = 2;
    rerender(view());
    expect(screen.queryByAltText('선택한 팀 인증 사진')).not.toBeInTheDocument();
    expect(revoke).toHaveBeenCalledWith(url);
  });

  it('개발 브라우저는 파일 선택 없이 고정 JPEG와 오류 안내만 표시한다', async () => {
    auth.isNative = false;
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_API_MOCKING', 'true');
    const { user } = setup();
    expect(screen.getByAltText('개발용 JPEG 미리보기')).toHaveAttribute(
      'src',
      expect.stringContaining('photo-fixture.jpg'),
    );
    expect(screen.queryByLabelText('인증 사진 파일')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '인증 사진 선택' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '오류 안내 보기' }));
    expect(screen.getByRole('status')).toHaveTextContent('사진을 준비하지 못했어요');
    expect(screen.getByAltText('개발용 JPEG 미리보기')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '오류 안내 닫기' }));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(pickAttendancePhoto).not.toHaveBeenCalled();
    expect(createUrl).not.toHaveBeenCalled();
  });
});
