import { content, description, title } from '@/shared/ui/page.css';

export function LoginPage() {
  return (
    <main className={content}>
      <h1 className={title}>로그인</h1>
      <p className={description}>카카오·Apple로 계속하기를 준비하고 있어요.</p>
    </main>
  );
}
