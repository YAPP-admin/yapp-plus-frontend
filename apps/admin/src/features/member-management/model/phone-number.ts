import { z } from 'zod';

/** 허용한 두 입력 형식만 정규화하며 유실된 앞자리나 잘못된 구분자는 복구하지 않는다. */
export const memberPhoneNumberSchema = z
  .string()
  .trim()
  .regex(/^(?:010[0-9]{8}|010-[0-9]{4}-[0-9]{4})$/, '전화번호 형식을 확인해 주세요.')
  .transform((value) => value.replaceAll('-', ''));

/** 검증되지 않은 값은 표시 단계에서도 거절한다. */
export function formatMemberPhoneNumber(value: string): string {
  const phone = memberPhoneNumberSchema.parse(value);
  return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
}
