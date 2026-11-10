'use client';

/** 이름·휴대폰 번호를 단계별로 수집하고 native 가입 완료를 실행하는 화면입니다. */

import { VStack } from '@seed-design/react';
import type { AuthFieldError } from '@yapp-plus/app-bridge';
import { ActionButton, Text, TextField, TextFieldInput } from '@yapp-plus/ui';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import { useFlow } from '@stackflow/react';
import { useId, useState, type FormEvent } from 'react';
import { useNativeAuthSession, useNativeSignupMutation } from '@/features/auth';
import { body, footer, form, screen } from '@/shared/ui/step-screen.css';
import { signupFormSchema, signupNameSchema, signupPhoneNumberSchema } from '../model/signup-form';

/** Signup Activity가 소유하는 입력 단계입니다. */
export type SignupStep = 'name' | 'phone';
type SignupFormValues = Readonly<{ name: string; phoneNumber: string }>;

/** 다음 단계 또는 서버 오류로 돌아온 입력칸을 사용자가 바로 수정할 수 있게 합니다. */
const focusInput = (input: HTMLInputElement | null): void => {
  input?.focus();
};

/** TanStack Form이 입력·검증을 관리하고 mutation 결과는 화면 전환으로 연결합니다. */
export function SignupPage({
  step,
  onPhoneStep,
  onNameStep,
}: {
  step: SignupStep;
  onPhoneStep: () => void;
  onNameStep: () => void;
}) {
  const flow = useFlow();
  const { isNative } = useNativeAuthSession();
  const titleId = useId();
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<readonly AuthFieldError[]>([]);
  const signupMutation = useNativeSignupMutation({
    onSignedIn: () => flow.replace('SignupComplete', {}),
    onFailure: (result) => {
      if (!result) {
        setErrorMessage('가입 브리지를 사용할 수 없어요. 앱을 다시 실행해 주세요.');
        return;
      }
      if (result.status === 'ERROR' && result.fieldErrors?.length) {
        setFieldErrors(result.fieldErrors);
        setErrorMessage('');
        if (result.fieldErrors.some(({ field: errorField }) => errorField === 'name')) {
          onNameStep();
        }
        return;
      }
      setErrorMessage('가입 중 문제가 발생했어요. 다시 로그인해 주세요.');
    },
  });
  const isSubmitting = signupMutation.isPending;
  const signupForm = useForm({
    defaultValues: { name: '', phoneNumber: '' } satisfies SignupFormValues,
    validationLogic: revalidateLogic({ mode: 'submit', modeAfterSubmission: 'change' }),
    onSubmit: ({ value }) => {
      if (step === 'name') {
        onPhoneStep();
        return;
      }

      if (!isNative) {
        flow.push('SignupStatus', {});
        return;
      }

      setErrorMessage('');
      setFieldErrors([]);
      const normalizedValue = signupFormSchema.parse(value);
      signupMutation.mutate(normalizedValue);
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (signupMutation.isPending) {
      return;
    }

    setErrorMessage('');
    void signupForm.handleSubmit();
  }

  return (
    <VStack as="main" className={screen}>
      <VStack as="form" className={form} onSubmit={handleSubmit}>
        <VStack className={body} gap="x10">
          <Text as="h1" id={titleId} textStyle="t10Bold" color="fg.neutral">
            {step === 'name' ? '이름을 입력해 주세요' : '휴대폰 번호를 입력해 주세요'}
          </Text>
          {step === 'name' ? (
            <signupForm.Field
              name="name"
              validators={{
                onDynamic: signupNameSchema,
              }}
            >
              {(field) => (
                <TextField
                  key="name"
                  invalid={fieldErrors.some(({ field: errorField }) => errorField === 'name')}
                  errorMessage={fieldErrorMessage(
                    fieldErrors.find(({ field: errorField }) => errorField === 'name'),
                  )}
                  value={field.state.value}
                  onValueChange={({ value }) => {
                    field.handleChange(value);
                    setFieldErrors((errors) =>
                      errors.filter(({ field: errorField }) => errorField !== 'name'),
                    );
                  }}
                >
                  <TextFieldInput
                    aria-labelledby={titleId}
                    name="name"
                    ref={
                      fieldErrors.some(({ field: errorField }) => errorField === 'name')
                        ? focusInput
                        : undefined
                    }
                    autoComplete="name"
                    enterKeyHint="next"
                    placeholder="본인 이름을 입력해 주세요"
                    onBlur={field.handleBlur}
                  />
                </TextField>
              )}
            </signupForm.Field>
          ) : (
            <signupForm.Field
              name="phoneNumber"
              validators={{
                onDynamic: signupPhoneNumberSchema,
              }}
            >
              {(field) => (
                <TextField
                  key="phone"
                  invalid={fieldErrors.some(
                    ({ field: errorField }) => errorField === 'phoneNumber',
                  )}
                  errorMessage={fieldErrorMessage(
                    fieldErrors.find(({ field: errorField }) => errorField === 'phoneNumber'),
                  )}
                  value={field.state.value}
                  onValueChange={({ value }) => {
                    field.handleChange(value);
                    setFieldErrors((errors) =>
                      errors.filter(({ field: errorField }) => errorField !== 'phoneNumber'),
                    );
                  }}
                >
                  <TextFieldInput
                    ref={focusInput}
                    aria-labelledby={titleId}
                    name="phoneNumber"
                    type="tel"
                    autoComplete="tel-national"
                    enterKeyHint="done"
                    placeholder="휴대폰 번호를 입력해 주세요"
                    onBlur={field.handleBlur}
                  />
                </TextField>
              )}
            </signupForm.Field>
          )}
          {errorMessage ? (
            <Text role="alert" color="fg.negative" textStyle="t4Regular">
              {errorMessage}
            </Text>
          ) : null}
        </VStack>

        <VStack className={footer}>
          <signupForm.Subscribe
            selector={(state) => ({
              canSubmit:
                (step === 'name' ? state.values.name : state.values.phoneNumber).trim().length > 0,
            })}
          >
            {({ canSubmit }) => (
              <ActionButton
                type="submit"
                size="large"
                variant="brandSolid"
                disabled={!canSubmit || isSubmitting}
                loading={isSubmitting}
              >
                다음
              </ActionButton>
            )}
          </signupForm.Subscribe>
        </VStack>
      </VStack>
    </VStack>
  );
}

/** 브리지의 공개 오류 코드만 사용자 안내로 바꿉니다. */
function fieldErrorMessage(error: AuthFieldError | undefined): string | undefined {
  if (!error) {
    return undefined;
  }
  const label = error.field === 'name' ? '이름' : '휴대폰 번호';
  switch (error.code) {
    case 'REQUIRED':
      return `${label}${error.field === 'name' ? '을' : '를'} 입력해 주세요.`;
    case 'INVALID_FORMAT':
      return `${label} 형식을 확인해 주세요.`;
    case 'TOO_LONG':
      return `${label}${error.field === 'name' ? '이' : '가'} 너무 길어요.`;
    case 'ALREADY_EXISTS':
      return `이미 사용 중인 ${label}입니다.`;
  }
  return undefined;
}
