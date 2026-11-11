import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Image } from './image';

it('브라우저 이미지 우선순위 속성을 정적 img에 전달한다', () => {
  render(
    <Image
      src="/images/notices/graphic-error.svg"
      alt="오류 안내"
      width={350}
      height={170}
      fetchPriority="high"
    />,
  );

  expect(screen.getByRole('img', { name: '오류 안내' })).toHaveAttribute('fetchpriority', 'high');
});
