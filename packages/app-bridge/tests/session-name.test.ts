import { expect, it } from 'vitest';
import { sessionNameSchema } from '../src/index';

it('표시 이름의 앞뒤 공백을 제거한다', () => {
  expect(sessionNameSchema.parse('  테스트 사용자  ')).toBe('테스트 사용자');
});

it.each([undefined, null, 7, {}, '', '  '])(
  '이름이 없거나 잘못되어도 인증을 거부하지 않는다 (%s)',
  (name) => {
    expect(sessionNameSchema.parse(name)).toBeUndefined();
  },
);
