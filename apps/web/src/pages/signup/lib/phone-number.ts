const MOBILE_NUMBER = /^01[016789]\d{7,8}$/;

export function toPhoneDigits(value: string) {
  return value.replaceAll(/\D/g, '').slice(0, 11);
}

// 입력 중에도 010-1234-5678 형태로 보이도록 하이픈을 넣습니다.
export function formatPhoneNumber(value: string) {
  const digits = toPhoneDigits(value);
  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  const middleLength = digits.length === 11 ? 4 : 3;
  return `${digits.slice(0, 3)}-${digits.slice(3, 3 + middleLength)}-${digits.slice(3 + middleLength)}`;
}

// 서버 검증 전 형식만 확인합니다. 실제 번호 확인은 가입 API 계약을 따릅니다.
export function isMobilePhoneNumber(value: string) {
  return MOBILE_NUMBER.test(toPhoneDigits(value));
}
