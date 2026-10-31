import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

function csvFile(name: string, memberName: string, generation = '33') {
  return new File(
    [`${memberImportHeaders.join(',')}\n${memberName},01012345678,${generation},pm,active-member`],
    name,
    { type: 'text/csv' },
  );
}

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

it('CSV 파일을 선택하면 읽기 상태와 6b 집계를 표시한다', async () => {
  const user = userEvent.setup();
  renderPage();

  await user.upload(screen.getByLabelText('회원 명단 파일'), csvFile('members.csv', '홍길동'));

  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent('members.csv 파일을 읽었어요.'),
  );
  expect(screen.getByRole('status')).toHaveTextContent('정상 1건');
  expect(screen.getByText('선택한 파일: members.csv')).toBeVisible();
});

it('드롭도 파일 선택과 같은 파싱 경로를 사용한다', async () => {
  renderPage();
  const file = csvFile('dropped.csv', '드롭 회원');
  const dropzone = screen.getByText('CSV 파일을 여기에 놓거나 파일을 선택하세요.').parentElement;

  if (dropzone === null) {
    throw new Error('CSV 드롭 영역을 찾을 수 없습니다.');
  }
  fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });

  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent('dropped.csv 파일을 읽었어요.'),
  );
});

it('잘못된 CSV는 오류를 표시하고 다시 올리기로 상태를 초기화한다', async () => {
  const user = userEvent.setup();
  renderPage();

  await user.upload(
    screen.getByLabelText('회원 명단 파일'),
    new File(['잘못된,헤더\n값'], 'invalid.csv', { type: 'text/csv' }),
  );

  expect(await screen.findByRole('alert')).toHaveTextContent(
    '첫 행은 이름/전화번호/기수/직군/권한 순서여야 해요.',
  );
  await user.click(screen.getByRole('button', { name: '다시 올리기' }));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.queryByText('선택한 파일: invalid.csv')).not.toBeInTheDocument();
});

it('파일을 교체하면 최신 파일 결과만 남는다', async () => {
  const user = userEvent.setup();
  renderPage();
  const input = screen.getByLabelText('회원 명단 파일');

  await user.upload(input, csvFile('first.csv', '첫 번째'));
  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent('first.csv 파일을 읽었어요.'),
  );
  await user.click(screen.getByRole('button', { name: '다시 올리기' }));
  await user.upload(input, csvFile('second.csv', '두 번째'));

  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent('second.csv 파일을 읽었어요.'),
  );
  expect(screen.queryByText('first.csv 파일을 읽었어요.')).not.toBeInTheDocument();
});
