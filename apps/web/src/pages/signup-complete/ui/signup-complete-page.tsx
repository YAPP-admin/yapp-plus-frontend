import Link from 'next/link';
import { content, description, title } from '../../../shared/ui/page.css';
import { link } from '../../../shared/ui/page-links.css';

export function SignupCompletePage() {
  return (
    <main className={content}>
      <h1 className={title}>가입 완료</h1>
      <p className={description}>
        가입 완료 안내를 준비하고 있어요. 현재 가입 결과는 표시되지 않아요.
      </p>
      <Link className={link} href="/">
        홈으로 이동
      </Link>
    </main>
  );
}
