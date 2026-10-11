import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomePage } from '../../pages/home';
import { PageShell } from './page-shell';

describe('PageShell', () => {
  it('홈을 감쌀 때 헤더와 본문 영역을 중복 렌더링하지 않는다', () => {
    render(
      <PageShell>
        <HomePage />
      </PageShell>,
    );

    expect(screen.getAllByRole('banner')).toHaveLength(1);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('banner')).toHaveTextContent('YAPP+');
    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { level: 1, name: 'YAPP+' }),
    );
  });
});
