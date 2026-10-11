import { content, description, title } from '@/shared/ui/page.css';

export function SignupPage() {
  return (
    <main className={content}>
      <h1 className={title}>추가 정보 입력</h1>
      <p className={description}>신규 회원의 이름·전화번호 입력 화면을 준비하고 있어요.</p>
    </main>
  );
}
