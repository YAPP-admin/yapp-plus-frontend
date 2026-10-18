'use client';

import { headline } from '@/shared/ui/page.css';
import { ActionButton, TextField, TextFieldInput } from '@yapp-plus/ui';
import { useId, useState, type FormEvent } from 'react';
import { bottom, contents, form, page, submitButton } from './signup-page.css';

function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  // 향후 휴대폰 번호 입력 단계로 이동
}

export function SignupPage() {
  const titleId = useId();
  const [name, setName] = useState('');
  const canSubmit = name.trim().length > 0;

  return (
    <main className={page}>
      <form className={form} onSubmit={handleSubmit}>
        <div className={contents}>
          <h1 id={titleId} className={headline}>
            이름을 입력해 주세요
          </h1>
          <TextField value={name} onValueChange={({ value }) => setName(value)}>
            <TextFieldInput
              aria-labelledby={titleId}
              name="name"
              autoComplete="name"
              enterKeyHint="next"
              placeholder="본인 이름을 입력해 주세요"
            />
          </TextField>
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
