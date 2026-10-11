import { content, description, title } from '@/shared/ui/page.css';

export function SignupStatusPage() {
  return (
    <main className={content}>
      <h1 className={title}>가입 승인 상태</h1>
      <p className={description}>
        가입 승인 상태 안내를 준비하고 있어요. 현재 승인 결과는 표시되지 않아요.
      </p>
    </main>
  );
}
