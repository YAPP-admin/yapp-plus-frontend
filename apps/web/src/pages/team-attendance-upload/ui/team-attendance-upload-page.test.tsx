import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TeamAttendanceUploadPage } from './team-attendance-upload-page';

const mockPush = vi.fn<(url: string) => void>();
const mockBack = vi.fn<() => void>();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: vi.fn<(url: string) => void>(),
  }),
  useSearchParams: () => ({
    get: vi.fn<(name: string) => string | null>().mockReturnValue(null),
  }),
}));

describe('TeamAttendanceUploadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('팀 세션 인증 업로드 페이지가 정상 렌더링되고 팀원 선택을 토글할 수 있다', () => {
    render(<TeamAttendanceUploadPage />);

    expect(screen.getByRole('heading', { name: '팀 세션 인증' })).toBeInTheDocument();
    expect(screen.getByText('사진에 나온 팀원을 선택해 주세요')).toBeInTheDocument();
    expect(screen.getByText('강야뿌')).toBeInTheDocument();
    expect(screen.getByText('김야뿌')).toBeInTheDocument();

    const memberCards = screen.getAllByRole('checkbox');
    expect(memberCards).toHaveLength(5);

    // 토글 테스트
    const firstCheckbox = memberCards[0];
    expect(firstCheckbox).toBeDefined();
    if (firstCheckbox) {
      fireEvent.click(firstCheckbox);
    }

    // 확인 버튼 클릭 시 이동
    const confirmBtn = screen.getByRole('button', { name: '확인' });
    fireEvent.click(confirmBtn);
    expect(mockPush).toHaveBeenCalledWith('/team-attendance/complete');
  });
});
