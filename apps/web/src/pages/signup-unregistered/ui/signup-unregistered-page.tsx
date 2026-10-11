import { content, description, title } from '@/shared/ui/page.css';

export function SignupUnregisteredPage() {
  return (
    <main className={content}>
      <h1 className={title}>미등록 회원 안내</h1>
      <p className={description}>
        회원 확인 안내를 준비하고 있어요. 현재 회원 등록 여부는 표시되지 않아요.
      </p>
    </main>
  );
}
