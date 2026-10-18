import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TextField, TextFieldInput } from './index';

describe('TextField', () => {
  it('라벨로 찾고 키보드 입력 값을 전달한다', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(values: { value: string }) => void>();
    render(
      <TextField label="이름" onValueChange={onValueChange}>
        <TextFieldInput />
      </TextField>,
    );

    await user.type(screen.getByRole('textbox', { name: '이름' }), '김야뿌');
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: '김야뿌' }));
  });

  it('invalid일 때만 오류 메시지를 표시하고 입력을 오류 상태로 알린다', () => {
    const { rerender } = render(
      <TextField label="이름" errorMessage="이름을 입력해 주세요">
        <TextFieldInput />
      </TextField>,
    );
    expect(screen.queryByText('이름을 입력해 주세요')).not.toBeInTheDocument();

    rerender(
      <TextField label="이름" errorMessage="이름을 입력해 주세요" invalid>
        <TextFieldInput />
      </TextField>,
    );
    expect(screen.getByText('이름을 입력해 주세요')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '이름' })).toHaveAttribute('aria-invalid', 'true');
  });
});
