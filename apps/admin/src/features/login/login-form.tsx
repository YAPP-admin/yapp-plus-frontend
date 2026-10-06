import { ActionButton } from '@yapp-plus/ui';
import * as styles from './login-form.css';

export function LoginForm() {
  return (
    <main className={styles.page} data-seed-color-mode="dark-only">
      <div className={styles.layout}>
        <h1 className={styles.brand}>
          YAPP<span className={styles.brandSubtitle}>Admin</span>
        </h1>
        <form className={styles.form} aria-label="관리자 로그인">
          <div className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor="username" className={styles.label}>
                아이디
              </label>
              <input
                id="username"
                name="username"
                className={styles.input}
                autoComplete="username"
                placeholder="아이디를 입력해주세요."
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className={styles.input}
                autoComplete="current-password"
                placeholder="비밀번호를 입력해주세요."
              />
            </div>
          </div>
          <ActionButton type="submit" className={styles.submit} variant="neutralSolid" disabled>
            로그인
          </ActionButton>
          <p className={styles.feedback}>로그인 기능을 준비 중입니다.</p>
        </form>
      </div>
    </main>
  );
}
