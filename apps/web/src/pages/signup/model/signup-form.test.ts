import { describe, expect, it } from 'vitest';
import { signupFormSchema } from './signup-form';

describe('signupFormSchema', () => {
  it('필수 입력값을 검증하고 전송 값의 앞뒤 공백을 제거한다', () => {
    expect(
      signupFormSchema.safeParse({ name: '  김야뿌 ', phoneNumber: ' 010-1234-5678 ' }),
    ).toEqual({
      success: true,
      data: { name: '김야뿌', phoneNumber: '010-1234-5678' },
    });
  });

  it('필수 입력값이 비어 있으면 검증에 실패한다', () => {
    const result = signupFormSchema.safeParse({ name: '   ', phoneNumber: '' });

    expect(result.success).toBe(false);
    const messages = result.success ? [] : result.error.issues.map((issue) => issue.message);
    expect(messages).toEqual(['이름을 입력해 주세요.', '휴대폰 번호를 입력해 주세요.']);
  });
});
