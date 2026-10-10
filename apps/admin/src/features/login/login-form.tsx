import { revalidateLogic, useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { ActionButton } from '@yapp-plus/ui';
import { useRef } from 'react';
import { LOGIN_FIELDS, UNAVAILABLE_MESSAGE } from './login-form.constants';
import type { Login, LoginInput, LoginResult } from './login';
import * as styles from './login-form.css';

type LoginFormProps = {
  login: Login;
  onSuccess: () => void | Promise<void>;
  available: boolean;
};

function getSubmissionError(result: LoginResult | undefined, isError: boolean) {
  if (isError || result?.status === 'unavailable') {
    return UNAVAILABLE_MESSAGE;
  }

  if (result?.status === 'invalid-credentials') {
    return '아이디 혹은 비밀번호가 일치하지 않아요.';
  }

  return null;
}

export function LoginForm({ login, onSuccess, available }: LoginFormProps) {
  const formElement = useRef<HTMLFormElement>(null);
  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: async (result) => {
      if (result.status === 'success') {
        await onSuccess();
      }
    },
  });
  const submissionError = getSubmissionError(loginMutation.data, loginMutation.isError);
  const form = useForm({
    defaultValues: { username: '', password: '' },
    validationLogic: revalidateLogic({ mode: 'submit', modeAfterSubmission: 'change' }),
    onSubmitInvalid: ({ formApi }) => {
      const first = LOGIN_FIELDS.find(({ name }) => formApi.getFieldMeta(name)?.errors.length);
      const input = first && formElement.current?.elements.namedItem(first.name);

      if (input instanceof HTMLInputElement) {
        input.focus();
      }
    },
    onSubmit: ({ value }) => {
      if (!available) {
        return;
      }

      loginMutation.mutate({ username: value.username.trim(), password: value.password });
    },
  });

  return (
    <main className={styles.page} data-seed-color-mode="dark-only">
      <div className={styles.layout}>
        <h1 className={styles.brand}>
          YAPP<span className={styles.brandSubtitle}>Admin</span>
        </h1>
        <form
          ref={formElement}
          className={styles.form}
          aria-label="관리자 로그인"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();

            if (!available || loginMutation.isPending) {
              return;
            }

            loginMutation.reset();
            void form.handleSubmit();
          }}
        >
          <div className={styles.fields}>
            {LOGIN_FIELDS.map(({ name, label, type, autoComplete }) => (
              <form.Field
                key={name}
                name={name}
                validators={{
                  onDynamic: ({ value }) =>
                    (name === 'username' ? value.trim() : value).length
                      ? undefined
                      : `${label}를 입력해주세요.`,
                }}
              >
                {(field) => (
                  <div className={styles.field}>
                    <label htmlFor={name} className={styles.label}>
                      {label}
                    </label>
                    <input
                      id={name}
                      name={name}
                      type={type}
                      className={styles.input}
                      autoComplete={autoComplete}
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      readOnly={loginMutation.isPending}
                      placeholder={`${label}를 입력해주세요.`}
                      value={field.state.value}
                      aria-invalid={field.state.meta.errors.length > 0}
                      aria-describedby={
                        field.state.meta.errors.length ? `${name}-error` : undefined
                      }
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        loginMutation.reset();
                        field.handleChange(event.target.value);
                      }}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p id={`${name}-error`} role="alert" className={styles.fieldError}>
                        {field.state.meta.errors.join(' ')}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            ))}
          </div>
          <ActionButton
            type="submit"
            className={styles.submit}
            variant="neutralSolid"
            disabled={!available || loginMutation.isPending}
            loading={loginMutation.isPending}
            aria-busy={loginMutation.isPending}
          >
            로그인
          </ActionButton>
          <div className={styles.feedback} role="alert" aria-atomic="true">
            {available ? submissionError : '로그인 기능을 준비 중입니다.'}
          </div>
        </form>
      </div>
    </main>
  );
}
