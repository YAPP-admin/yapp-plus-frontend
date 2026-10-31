import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { expect, it, vi } from 'vitest';
import { memberPreviewAfterMapping } from '~/features/member-management/fixtures';
import { memberImportHeaders } from '../model/import-file';
import { MemberImportPage } from './member-import-page';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: { children: ReactNode; className?: string }) => (
    <a href="/members" {...props}>
      {children}
    </a>
  ),
}));

function renderPage() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemberImportPage
        members={memberPreviewAfterMapping.members}
        currentGeneration={memberPreviewAfterMapping.currentGeneration}
      />
    </QueryClientProvider>,
  );
}

function csvFile() {
  const existingMember = memberPreviewAfterMapping.members[0];
  if (existingMember === undefined) {
    throw new Error('중복 검토에 필요한 회원 fixture가 없습니다.');
  }

  return new File(
    [
      `${memberImportHeaders.join(',')}
신규 회원,01099999999,33,pm,active-member
잘못된 행,01012345678,33,unknown,active-member
${existingMember.name},${existingMember.phoneNumber},33,${existingMember.activities[1]?.part},${existingMember.activities[1]?.role}`,
    ],
    'preview.csv',
    { type: 'text/csv' },
  );
}

it('마지막 중복 행에도 원본 행과 라디오 이름이 연결된다', async () => {
  const user = userEvent.setup();
  renderPage();

  await user.upload(screen.getByLabelText('회원 명단 파일'), csvFile());

  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('전체 3건'));

  const lastRow = screen.getByRole('row', { name: /4행/ });
  const group = within(lastRow).getByRole('radiogroup', {
    name: '4행 예시 회원 1 중복 처리',
  });
  expect(within(group).getAllByRole('radio')).toHaveLength(2);
  expect(within(lastRow).getByText('건너뛰기')).toBeVisible();
});

it('중복 처리 선택에 따라 예정 수를 바꾸고 반영은 비활성화한다', async () => {
  const user = userEvent.setup();
  renderPage();

  await user.upload(screen.getByLabelText('회원 명단 파일'), csvFile());
  await waitFor(() =>
    expect(within(screen.getByRole('status')).getByText('반영 예정 1건')).toBeVisible(),
  );

  const lastRow = screen.getByRole('row', { name: /4행/ });
  await user.click(within(lastRow).getByText('덮어쓰기'));

  expect(screen.getAllByText('반영 예정 2건')).toHaveLength(2);
  expect(screen.getByRole('button', { name: '회원 명단 반영 준비 중' })).toBeDisabled();
  expect(screen.queryByText('반영이 완료됐어요.')).not.toBeInTheDocument();
});
