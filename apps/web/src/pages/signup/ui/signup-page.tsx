'use client';

import { ActionButton, Text, TextField, TextFieldInput } from '@yapp-plus/ui';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { body, footer, screen } from '@/shared/ui/step-screen.css';
import { fields, form } from './signup-page.css';

type Step = 'name' | 'phone';

export function SignupPage() {
  const router = useRouter();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
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
    // 향후 이름·휴대폰 번호로 가입 요청 후 결과에 따라 이동
    router.push('/signup/status');
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
        </div>

        <div className={footer}>
          <ActionButton type="submit" size="large" variant="brandSolid" disabled={!canSubmit}>
            다음
          </ActionButton>
        </div>
      </form>
    </main>
  );
}
