/** 결과 시트의 문구·접근성 연결·후속 행동·포커스 복귀를 실제 BottomSheet로 검증합니다. */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expect, it, vi } from 'vitest';
import type { TeamAttendanceResult } from '../model/team-attendance-result';
import { TEAM_ATTENDANCE_RESULT_FIXTURES as FIXTURES } from '../model/team-attendance-result-fixtures';
import { TeamAttendanceResultSheet } from './team-attendance-result-sheet';

vi.mock('@seed-design/stackflow', () => ({ useActivityZIndexBase: () => 200 }));

async function setup(result: TeamAttendanceResult = FIXTURES[0].result, showSession = false) {
  const events: string[] = [];
  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>결과 열기</button>
        <TeamAttendanceResultSheet
          result={result}
          showSession={showSession}
          open={open}
          onOpenChange={(value) => {
            if (!value) {
              events.push('close');
            }
            setOpen(value);
          }}
          onReupload={(sessionId) => events.push(`upload:${sessionId}`)}
          onContact={() => events.push('contact')}
        />
      </>
    );
  }
  const user = userEvent.setup();
  const { container } = render(<Harness />);
  const trigger = screen.getByRole('button', { name: '결과 열기' });
  await user.click(trigger);
  const dialog = await screen.findByRole('dialog');
  // happy-dom은 시트 진입 애니메이션을 재생하지 않으므로 최종 위치에서 사용자 행동을 검증합니다.
  dialog.style.transform = 'none';
  return { user, dialog, trigger, events, container };
}

it.each([
  [0, '팀 세션 인증이 반려됐어요', '18:00 전까지 다시 업로드해 주세요'],
  [1, '결석으로 처리됐어요', '확인이 필요하면 운영진에게 문의해 주세요'],
  [2, '팀 세션 출석이 완료됐어요!', '운영진이 출석을 승인했어요'],
  [4, '팀 세션 인증이 반려됐어요', '재업로드 기한이 지났어요'],
  [5, '팀 세션 인증이 반려됐어요', '현재 다시 업로드할 수 없어요'],
] as const)('상태 %i의 제목과 설명을 접근성 트리에 연결한다', async (index, title, description) => {
  const { dialog } = await setup(FIXTURES[index].result);
  expect(dialog).toHaveAccessibleName(title);
  expect(dialog).toHaveAccessibleDescription(description);
  expect(screen.getByRole('heading', { name: title })).toBeVisible();
});

it.each([0, 1, 3, 4, 5] as const)('반려·결석 상태 %i에 고정 사유를 표시한다', async (index) => {
  await setup(FIXTURES[index].result);
  expect(screen.getByText('사유: 사진에서 확인되지 않았어요')).toBeVisible();
});

it('과거 세션 이름과 날짜를 고정 사유와 함께 제공한다', async () => {
  await setup(FIXTURES[6].result, true);
  expect(screen.getByText('사유: 사진에서 확인되지 않았어요')).toBeVisible();
  expect(screen.getByText('2026-11-26 · 5주차 팀 세션')).toBeVisible();
});

it('재업로드를 선택하면 먼저 닫고 해당 세션을 전달한다', async () => {
  const { user, events, dialog } = await setup();
  const button = screen.getByRole('button', { name: '다시 업로드하기' });
  await waitFor(() => expect(dialog).toHaveFocus());
  await user.tab();
  expect(button).toHaveFocus();
  await user.click(button);
  expect(events).toEqual(['close', 'upload:101']);
});

it('문의는 닫기를 요청한 뒤 호출한다', async () => {
  const { user, events, dialog } = await setup(FIXTURES[1].result);
  await waitFor(() => expect(dialog).toHaveFocus());
  await user.tab();
  expect(screen.getByRole('button', { name: '운영진에게 문의하기' })).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(events).toEqual(['close', 'contact']);
});

it.each([2, 4, 5] as const)('상태 %i의 확인은 후속 이동 없이 닫는다', async (index) => {
  const { user, events, trigger } = await setup(FIXTURES[index].result);
  expect(screen.queryByRole('button', { name: '다시 업로드하기' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '확인' }));
  expect(events).toEqual(['close']);
  await waitFor(() => expect(trigger).toHaveFocus());
});

it('Escape로 닫아도 후속 행동 없이 포커스가 복귀한다', async () => {
  const { user, trigger, events, dialog } = await setup();
  await waitFor(() => expect(dialog).toHaveFocus());
  await user.keyboard('{Escape}');
  expect(events).toEqual(['close']);
  await waitFor(() => expect(trigger).toHaveFocus());
});

it('시트를 호출 화면 안에 렌더링해 Activity의 레이어 경계를 유지한다', async () => {
  const { container, dialog } = await setup();
  expect(container).toContainElement(dialog);
});

it('출석 완료에는 사유 영역을 표시하지 않는다', async () => {
  await setup(FIXTURES[2].result);
  expect(screen.queryByText(/^사유:/)).not.toBeInTheDocument();
});
