/** 회원가입 화면의 입력 규칙을 API 브리지 계약에서 확장해 관리합니다. */

import { completeSignupInputSchema } from '@yapp-plus/app-bridge';

const signupFieldSchemas = {
  name: completeSignupInputSchema.shape.name.trim().min(1, '이름을 입력해 주세요.'),
  phoneNumber: completeSignupInputSchema.shape.phoneNumber
    .trim()
    .min(1, '휴대폰 번호를 입력해 주세요.'),
} as const;

/** 화면에서 사용하는 가입 입력 스키마입니다. 입력 문자열은 전송 전에 trim됩니다. */
export const signupFormSchema = completeSignupInputSchema.extend(signupFieldSchemas);

/** TanStack Form 이름 필드에 연결하는 Standard Schema validator입니다. */
export const signupNameSchema = signupFieldSchemas.name;

/** TanStack Form 휴대폰 번호 필드에 연결하는 Standard Schema validator입니다. */
export const signupPhoneNumberSchema = signupFieldSchemas.phoneNumber;
