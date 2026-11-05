'use client';

import { ActionButton, Text, TextField, TextFieldInput } from '@yapp-plus/ui';
import { useFlow } from '@stackflow/react/future';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useNativeAuthSession, useNativeSignupMutation } from '@/features/auth';
import { body, footer, screen } from '@/shared/ui/step-screen.css';
import { fields, form } from './signup-page.css';

type Step = 'name' | 'phone';

export function SignupPage() {
  const flow = useFlow();
  const { isNative } = useNativeAuthSession();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const signupMutation = useNativeSignupMutation();
  const isSubmitting = signupMutation.isPending;
  // 피그마 시안처럼 값이 비어 있으면 다음 버튼을 비활성화합니다. 형식 검증은 서버 계약에서 정합니다.
  const canSubmit = (step === 'name' ? name : phone).trim().length > 0;

  useEffect(() => {
    if (step === 'phone') {
      inputRef.current?.focus();
    }
  }, [step]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    if (step === 'name') {
      setStep('phone');
      return;
    }

    if (isNative) {
      setErrorMessage('');
      signupMutation.mutate(
        { name, phoneNumber: phone },
        {
          onSuccess: (result) => {
            if (!result) {
              setErrorMessage('가입 브리지를 사용할 수 없어요. 앱을 다시 실행해 주세요.');
              return;
            }

            if (result.status === 'SIGNED_IN') {
              flow.replace('SignupComplete', {});
              return;
            }
            if (result.status === 'ERROR' && result.fieldErrors?.length) {
              setErrorMessage('입력한 정보를 다시 확인해 주세요.');
              return;
            }
            setErrorMessage('가입 중 문제가 발생했어요. 다시 로그인해 주세요.');
          },
          onError: () => {
            setErrorMessage('가입 결과를 확인하지 못했어요. 다시 로그인해 주세요.');
          },
        },
      );
      return;
    }

    flow.push('SignupStatus', {});
  }

  return (
    <main className={screen}>
      <form className={form} onSubmit={handleSubmit}>
        <div className={`${body} ${fields}`}>
          <Text as="h1" id={titleId} textStyle="t10Bold" color="fg.neutral">
            {step === 'name' ? '이름을 입력해 주세요' : '휴대폰 번호를 입력해 주세요'}
          </Text>
          {step === 'name' ? (
            <TextField key="name" value={name} onValueChange={({ value }) => setName(value)}>
              <TextFieldInput
                aria-labelledby={titleId}
                name="name"
                autoComplete="name"
                enterKeyHint="next"
                placeholder="본인 이름을 입력해 주세요"
              />
            </TextField>
          ) : (
            <TextField key="phone" value={phone} onValueChange={({ value }) => setPhone(value)}>
              <TextFieldInput
                ref={inputRef}
                aria-labelledby={titleId}
                name="phone"
                type="tel"
                autoComplete="tel-national"
                enterKeyHint="done"
                placeholder="휴대폰 번호를 입력해 주세요"
              />
            </TextField>
          )}
          {errorMessage ? (
            <Text role="alert" color="fg.negative" textStyle="t4Regular">
              {errorMessage}
            </Text>
          ) : null}
        </div>

        <div className={footer}>
          <ActionButton
            type="submit"
            size="large"
            variant="brandSolid"
            disabled={!canSubmit || isSubmitting}
          >
            다음
          </ActionButton>
        </div>
      </form>
    </main>
  );
}
