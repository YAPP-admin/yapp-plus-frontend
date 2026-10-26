/** 공통 폼의 대상 선택·조건부 필드·정규화 결과를 사용자 입력으로 검증한다. */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import type { NoticeFormContent } from '../model/notice-form';
import { NoticeForm } from './notice-form';

/** 폼을 열고 유효한 제목을 입력한다. */
async function setup() {
  const onSubmit = vi.fn<(value: NoticeFormContent) => void>();
  const user = userEvent.setup();
  render(<NoticeForm onSubmit={onSubmit} />);
  await user.type(screen.getByLabelText('제목'), '  테스트 공지  ');
  return { user, onSubmit };
}

/** 브라우저의 날짜·시각 선택 결과를 입력 이벤트로 전달한다. */
function enterDeadline() {
  fireEvent.change(screen.getByLabelText('마감 날짜 (한국 시간)'), {
    target: { value: '2020-01-01' },
  });
  fireEvent.change(screen.getByLabelText('마감 시각 (한국 시간)'), { target: { value: '09:30' } });
}

it.each(['전체 사용자', '활동회원', '정회원', '수료회원'])(
  '일반 대상 %s를 단일 선택한다',
  async (label) => {
    const { user, onSubmit } = await setup();
    await user.click(screen.getByRole('radio', { name: label }));
    await user.click(screen.getByRole('button', { name: '입력 확인' }));
    const expected = {
      '전체 사용자': 'all',
      활동회원: 'active',
      정회원: 'regular',
      수료회원: 'completed',
    }[label];
    expect(onSubmit).toHaveBeenCalledWith({
      title: '테스트 공지',
      category: 'session',
      audience: expected,
    });
  },
);

it('공백과 61자 제목을 거절하고 60자는 허용한다', async () => {
  const { user, onSubmit } = await setup();
  const title = screen.getByLabelText('제목');
  await user.clear(title);
  await user.type(title, '   ');
  await user.click(screen.getByRole('button', { name: '입력 확인' }));
  expect(onSubmit).not.toHaveBeenCalled();
  expect(title).toHaveAttribute('aria-invalid', 'true');
  await waitFor(() => expect(title).toHaveFocus());
  expect(screen.getByRole('alert')).toHaveTextContent('1~60자');
  expect(title).toHaveAccessibleDescription('제목을 앞뒤 공백 제외 1~60자로 입력하세요.');
  await user.clear(title);
  await user.type(title, '가'.repeat(61));
  await user.click(screen.getByRole('button', { name: '입력 확인' }));
  expect(onSubmit).not.toHaveBeenCalled();
  await user.type(title, '{Backspace}');
  await user.click(screen.getByRole('button', { name: '입력 확인' }));
  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: '가'.repeat(60) }));
});

it('제출 전체·직군은 배타적이며 빈 선택은 거절한다', async () => {
  const { user, onSubmit } = await setup();
  await user.click(screen.getByRole('radio', { name: '제출' }));
  const all = screen.getByRole('checkbox', { name: '활동회원 전체' });
  expect(all).toBeChecked();
  enterDeadline();
  await user.click(screen.getByRole('checkbox', { name: 'Web' }));
  await user.click(screen.getByRole('checkbox', { name: 'Design' }));
  expect(all).not.toBeChecked();
  await user.click(screen.getByRole('button', { name: '입력 확인' }));
  expect(onSubmit).toHaveBeenLastCalledWith(
    expect.objectContaining({
      audience: ['Web', 'Design'],
      submission: { deadlineAt: '2020-01-01T00:30:00.000Z', method: null },
    }),
  );
  await user.click(all);
  expect(screen.getByRole('checkbox', { name: 'Web' })).not.toBeChecked();
  await user.click(all);
  onSubmit.mockClear();
  await user.click(screen.getByRole('button', { name: '입력 확인' }));
  expect(onSubmit).not.toHaveBeenCalled();
  expect(screen.getByRole('alert')).toHaveTextContent('대상을 하나 이상');
  await waitFor(() => expect(all).toHaveFocus());
});

it('마감 날짜와 시각을 각각 요구한다', async () => {
  const { user, onSubmit } = await setup();
  await user.click(screen.getByRole('radio', { name: '제출' }));
  await user.click(screen.getByRole('button', { name: '입력 확인' }));
  expect(screen.getAllByRole('alert')).toHaveLength(2);
  await waitFor(() => expect(screen.getByLabelText('마감 날짜 (한국 시간)')).toHaveFocus());
  expect(onSubmit).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('마감 날짜 (한국 시간)'), {
    target: { value: '2020-01-01' },
  });
  await user.click(screen.getByRole('button', { name: '입력 확인' }));
  expect(screen.getAllByRole('alert')).toHaveLength(1);
  await waitFor(() => expect(screen.getByLabelText('마감 시각 (한국 시간)')).toHaveFocus());
});

it.each(['제출 방법 이름 (선택)', '제출 주소 (선택)'])(
  '%s만 입력하면 나머지도 요구한다',
  async (label) => {
    const { user, onSubmit } = await setup();
    await user.click(screen.getByRole('radio', { name: '제출' }));
    enterDeadline();
    await user.type(screen.getByLabelText(label), '임의 입력');
    await user.click(screen.getByRole('button', { name: '입력 확인' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    const other = label === '제출 주소 (선택)' ? '제출 방법 이름 (선택)' : '제출 주소 (선택)';
    await user.type(screen.getByLabelText(other), '주소 형식 검사 없음');
    await user.click(screen.getByRole('button', { name: '입력 확인' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  },
);

it('일반 종류로 전환하면 제출 데이터와 오류를 제거한다', async () => {
  const { user, onSubmit } = await setup();
  await user.click(screen.getByRole('radio', { name: '제출' }));
  await user.click(screen.getByRole('checkbox', { name: 'Web' }));
  await user.type(screen.getByLabelText('제출 방법 이름 (선택)'), '과제');
  await user.click(screen.getByRole('button', { name: '입력 확인' }));
  await user.click(screen.getByRole('radio', { name: '운영' }));
  expect(screen.queryByLabelText('마감 날짜 (한국 시간)')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '입력 확인' }));
  expect(onSubmit).toHaveBeenCalledWith({
    title: '테스트 공지',
    category: 'operation',
    audience: 'all',
  });
  await user.click(screen.getByRole('radio', { name: '제출' }));
  expect(screen.getByLabelText('마감 날짜 (한국 시간)')).toHaveValue('');
  expect(screen.getByLabelText('제출 방법 이름 (선택)')).toHaveValue('');
});

it('처리 실패 시 입력을 보존하고 재시도할 수 있다', async () => {
  const onSubmit = vi
    .fn<(value: NoticeFormContent) => Promise<void>>()
    .mockRejectedValueOnce(new Error('실패'))
    .mockResolvedValueOnce(undefined);
  const user = userEvent.setup();
  render(<NoticeForm onSubmit={onSubmit} />);
  await user.type(screen.getByLabelText('제목'), '보존할 제목');
  await user.click(screen.getByRole('button', { name: '입력 확인' }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('다시 시도'));
  expect(screen.getByLabelText('제목')).toHaveValue('보존할 제목');
  await user.click(screen.getByRole('button', { name: '입력 확인' }));
  expect(onSubmit).toHaveBeenCalledTimes(2);
});

it('처리 중에는 입력과 중복 제출을 막는다', async () => {
  const pending = Promise.withResolvers<void>();
  const onSubmit = vi.fn<(value: NoticeFormContent) => Promise<void>>(() => pending.promise);
  const user = userEvent.setup();
  render(<NoticeForm onSubmit={onSubmit} />);
  await user.type(screen.getByLabelText('제목'), '공지');
  const button = screen.getByRole('button', { name: '입력 확인' });
  await user.click(button);
  expect(button).toBeDisabled();
  expect(screen.getByLabelText('제목')).toBeDisabled();
  await user.click(button);
  expect(onSubmit).toHaveBeenCalledOnce();
  pending.resolve();
  await waitFor(() => expect(button).toBeEnabled());
});
