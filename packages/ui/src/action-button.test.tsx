import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type SubmitEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ActionButton } from './index';

describe('ActionButton', () => {
  it('접근 가능한 이름으로 찾고 클릭과 키보드로 실행할 수 있다', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn<() => void>();
    render(
      <ActionButton type="button" onClick={onClick}>
        계속
      </ActionButton>,
    );

    const button = screen.getByRole('button', { name: '계속' });
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('비활성 버튼은 클릭을 막고 Tab 이동에서 제외한다', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn<() => void>();
    render(
      <>
        <ActionButton type="button" disabled onClick={onClick}>
          계속
        </ActionButton>
        <button type="button">취소</button>
      </>,
    );

    await user.click(screen.getByRole('button', { name: '계속' }));
    expect(onClick).not.toHaveBeenCalled();
    await user.tab();
    expect(screen.getByRole('button', { name: '취소' })).toHaveFocus();
  });

  it('로딩 표시는 클릭을 막지 않으며 disabled를 별도로 적용한다', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn<() => void>();
    const { rerender } = render(
      <ActionButton type="button" loading onClick={onClick}>
        계속
      </ActionButton>,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /계속/ }));
    expect(onClick).toHaveBeenCalledOnce();

    rerender(
      <ActionButton type="button" loading disabled onClick={onClick}>
        계속
      </ActionButton>,
    );
    await user.click(screen.getByRole('button', { name: /계속/ }));
    expect(onClick).toHaveBeenCalledOnce();

    rerender(<ActionButton type="button">계속</ActionButton>);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('ref로 포커스를 옮겨 실행해도 type="button"이면 폼을 제출하지 않는다', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn<() => void>();
    const onSubmit = vi.fn<(event: SubmitEvent<HTMLFormElement>) => void>((event) => {
      event.preventDefault();
    });
    render(
      <form onSubmit={onSubmit}>
        <button type="button" onClick={() => ref.current?.focus()}>
          계속으로 이동
        </button>
        <ActionButton ref={ref} type="button" onClick={onClick}>
          계속
        </ActionButton>
      </form>,
    );

    await user.click(screen.getByRole('button', { name: '계속으로 이동' }));
    expect(screen.getByRole('button', { name: '계속' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
