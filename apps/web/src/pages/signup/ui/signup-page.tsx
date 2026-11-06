'use client';

/** 이름·휴대폰 번호를 단계별로 수집하고 native 가입 완료를 실행하는 화면입니다. */

import { ActionButton, Text, TextField, TextFieldInput } from '@yapp-plus/ui';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import { useFlow } from '@stackflow/react';
import { useId, useState, type FormEvent } from 'react';
import { useNativeAuthSession, useNativeSignupMutation } from '@/features/auth';
import { body, footer, screen } from '@/shared/ui/step-screen.css';
import { fields, form } from './signup-page.css';
import { signupFormSchema, signupNameSchema, signupPhoneNumberSchema } from '../model/signup-form';

type Step = 'name' | 'phone';
type SignupFormValues = Readonly<{ name: string; phoneNumber: string }>;

/** 전화번호 입력 필드가 DOM에 연결되는 순간 자동으로 포커스를 줍니다. */
const focusPhoneInput = (input: HTMLInputElement | null): void => {
  input?.focus();
};

/** TanStack Form이 입력·검증을 관리하고 mutation 결과는 화면 전환으로 연결합니다. */
export function SignupPage() {
  const flow = useFlow();
  const { isNative } = useNativeAuthSession();
  const titleId = useId();
  const [step, setStep] = useState<Step>('name');
  const [errorMessage, setErrorMessage] = useState('');
  const signupMutation = useNativeSignupMutation({
    onFailure: (result) => {
      if (!result) {
        setErrorMessage('가입 브리지를 사용할 수 없어요. 앱을 다시 실행해 주세요.');
        return;
      }
      setErrorMessage(
        result.status === 'ERROR' && result.fieldErrors?.length
          ? '입력한 정보를 다시 확인해 주세요.'
          : '가입 중 문제가 발생했어요. 다시 로그인해 주세요.',
      );
    },
  });
  const isSubmitting = signupMutation.isPending;
  const signupForm = useForm({
    defaultValues: { name: '', phoneNumber: '' } satisfies SignupFormValues,
    validationLogic: revalidateLogic({ mode: 'submit', modeAfterSubmission: 'change' }),
    onSubmit: ({ value }) => {
      if (step === 'name') {
        setStep('phone');
        return;
      }

      if (!isNative) {
        flow.push('SignupStatus', {});
        return;
      }

      setErrorMessage('');
      const normalizedValue = signupFormSchema.parse(value);
      signupMutation.mutate(normalizedValue);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (signupMutation.isPending) {
      return;
    }

    setErrorMessage('');
    void signupForm.handleSubmit();
  }

  return (
    <main className={screen}>
      <form className={form} onSubmit={handleSubmit}>
        <div className={`${body} ${fields}`}>
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
                  value={field.state.value}
                  onValueChange={({ value }) => field.handleChange(value)}
                >
                  <TextFieldInput
                    aria-labelledby={titleId}
                    name="name"
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
                  value={field.state.value}
                  onValueChange={({ value }) => field.handleChange(value)}
                >
                  <TextFieldInput
                    ref={focusPhoneInput}
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
        </div>

        <div className={footer}>
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
              >
                다음
              </ActionButton>
            )}
          </signupForm.Subscribe>
        </div>
      </form>
    </main>
  );
}
