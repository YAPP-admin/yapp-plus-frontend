import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LoginIllustration } from './login-illustration';

describe('LoginIllustration', () => {
  it('움직이는 조각들을 하나의 이미지로 묶어 스크린 리더에 노출한다', () => {
    render(<LoginIllustration />);

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAccessibleName('노트북으로 작업 중인 부엉이 캐릭터');
  });
});
