'use client';

import { ActionButton, Text, TextField, TextFieldInput } from '@yapp-plus/ui';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { formatPhoneNumber, isMobilePhoneNumber } from '../lib/phone-number';
import { bottom, contents, form, page, submitButton } from './signup-page.css';

type Step = 'name' | 'phone';

export function SignupPage() {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const canSubmit = step === 'name' ? name.trim().length > 0 : isMobilePhoneNumber(phone);

  // 같은 URL에 이력을 하나 쌓아 휴대폰 번호 단계의 뒤로가기가 이름 단계로 돌아오게 합니다.
  useEffect(() => {
    function handlePopState() {
      setStep('name');
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
      window.history.pushState(null, '', window.location.href);
      setStep('phone');
    }
    // 향후 이름·휴대폰 번호로 가입 요청
  }

  return (
    <main className={page}>
      <form className={form} onSubmit={handleSubmit}>
        <div className={contents}>
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
            <TextField
              key="phone"
              value={phone}
              onValueChange={({ value }) => setPhone(formatPhoneNumber(value))}
            >
              <TextFieldInput
                ref={inputRef}
                aria-labelledby={titleId}
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                enterKeyHint="done"
                placeholder="휴대폰 번호를 입력해 주세요"
              />
            </TextField>
          )}
        </div>

        <div className={bottom}>
          <ActionButton
            type="submit"
            size="large"
            variant="brandSolid"
            className={submitButton}
            disabled={!canSubmit}
          >
            다음
          </ActionButton>
        </div>
      </form>
    </main>
  );
}
