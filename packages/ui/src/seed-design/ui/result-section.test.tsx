import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ResultSection } from './result-section';

describe('ResultSection', () => {
  it('페이지 제목 계층에 맞는 제목과 설명을 표시한다', () => {
    render(
      <ResultSection
        titleAs="h2"
        title="검색 결과가 없어요"
        description="검색 조건을 변경해 주세요."
      />,
    );

    expect(screen.getByRole('heading', { level: 2, name: '검색 결과가 없어요' })).toBeVisible();
    expect(screen.getByText('검색 조건을 변경해 주세요.')).toBeVisible();
  });

  it('기본·보조 액션을 제공하고 클릭을 전달한다', async () => {
    const user = userEvent.setup();
    const onPrimaryClick = vi.fn<() => void>();
    const onSecondaryClick = vi.fn<() => void>();

    render(
      <ResultSection
        title="정보를 불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요."
        primaryActionProps={{ children: '다시 시도', onClick: onPrimaryClick }}
        secondaryActionProps={{ children: '목록으로', onClick: onSecondaryClick }}
      />,
    );

    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    await user.click(screen.getByRole('button', { name: '목록으로' }));

    expect(onPrimaryClick).toHaveBeenCalledOnce();
    expect(onSecondaryClick).toHaveBeenCalledOnce();
  });
});
