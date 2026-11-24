import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { HttpResponse, http } from 'msw';
import { expect, it, vi } from 'vitest';
import { memberPreviewAfterMapping } from '~/features/member-management/fixtures';
import { apiBaseUrl, server } from '~/mocks/server';
import { memberImportHeaders } from '../model/import-file';
import { MemberImportPage } from './member-import-page';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: { children: ReactNode; className?: string }) => (
    <a href="/members" {...props}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn<() => void>(),
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

function renderApiPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemberImportPage generationId={33} currentGeneration={33} />
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
${existingMember.name},${existingMember.phoneNumber},33,${existingMember.activities[1]?.part},active-member`,
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

it('중복 처리 선택에 따라 예정 수를 바꾸고 반영 가능 여부를 바꾼다', async () => {
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

it('API 검증이 끝난 유효한 행이 있으면 회원 명단 반영 버튼을 활성화한다', async () => {
  const user = userEvent.setup();
  const requestBodies: unknown[] = [];
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/roster-entries`, () =>
      HttpResponse.json({ items: [], nextCursor: null }),
    ),
    http.post(
      `${apiBaseUrl}/api/admin/generations/:generationId/roster-registrations`,
      async ({ request }) => {
        requestBodies.push(await request.json());
        return HttpResponse.json(
          {
            registrationId: 9001,
            generationId: 33,
            rows: [{ clientRowId: '2', rosterEntryId: 8001, action: 'CREATED' }],
            createdCount: 1,
            updatedCount: 0,
            unchangedCount: 0,
          },
          { status: 201 },
        );
      },
    ),
  );

  renderApiPage();
  await user.upload(
    screen.getByLabelText('회원 명단 파일'),
    new File(
      [`${memberImportHeaders.join(',')}\n신규 회원,01099999999,33,pm,active-member`],
      'registration.csv',
      { type: 'text/csv' },
    ),
  );

  const registerButton = await screen.findByRole('button', { name: '회원 명단 반영' });
  expect(registerButton).toBeEnabled();
  await user.click(registerButton);

  expect(await screen.findByRole('dialog', { name: '명단 등록이 완료됐어요.' })).toBeVisible();
  expect(screen.getByText('신규 1건 · 수정 0건 · 변경 없음 0건')).toBeVisible();
  expect(requestBodies).toEqual([
    {
      generationId: 33,
      entries: [
        {
          clientRowId: '2',
          generationId: 33,
          name: '신규 회원',
          phoneNumber: '010-9999-9999',
          position: 'PM',
          role: 'PLAYER',
        },
      ],
    },
  ]);
});

it('유효한 CSV를 선택한 뒤 현재 기수 사전 명단의 모든 cursor를 조회해 중복을 분류한다', async () => {
  const user = userEvent.setup();
  const cursors: (string | null)[] = [];
  server.use(
    http.get(`${apiBaseUrl}/api/admin/generations/:generationId/roster-entries`, ({ request }) => {
      const cursor = new URL(request.url).searchParams.get('cursor');
      cursors.push(cursor);
      if (cursor === null) {
        return HttpResponse.json({
          items: [
            {
              rosterEntryId: 7001,
              name: '기존 회원',
              phoneNumber: '+821012345678',
              generationId: 33,
              position: 'PM',
              role: 'PLAYER',
              status: 'AVAILABLE',
            },
          ],
          nextCursor: 'next-page',
        });
      }
      return HttpResponse.json({ items: [], nextCursor: null });
    }),
  );

  renderApiPage();
  await user.upload(
    screen.getByLabelText('회원 명단 파일'),
    new File(
      [`${memberImportHeaders.join(',')}\n기존 회원,01012345678,33,pm,active-member`],
      'api-preview.csv',
      { type: 'text/csv' },
    ),
  );

  expect(await screen.findByText('중복 1건')).toBeVisible();
  expect(screen.getByText('33기 사전 명단을 기준으로 검토하고 있어요.')).toBeVisible();
  expect(cursors).toEqual([null, 'next-page']);
});
