import { body, footer, heading, screen } from '@/shared/ui/step-screen.css';
import { ActionButton, Text } from '@yapp-plus/ui';
import Link from 'next/link';
import { contents, illustration } from './signup-complete-page.css';
import { CompleteIllustration } from './complete-illustration';

// 피그마 Sign-up_success. 라우팅 정책에 따라 뒤로가기 대신 홈으로 이동합니다.
export function SignupCompletePage() {
  return (
    <main className={screen}>
      <div className={`${body} ${contents}`}>
        <div className={heading}>
          <Text as="h1" textStyle="t10Bold" color="fg.neutral">
            회원가입을 완료했어요!
          </Text>
          <Text as="p" textStyle="t5Regular" color="fg.neutralMuted">
            YAPP의 새로운 멤버가 되신 걸 진심으로 환영해요
          </Text>
        </div>
        <CompleteIllustration className={illustration} />
      </div>
      <div className={footer}>
        <ActionButton asChild size="large" variant="brandSolid">
          <Link href="/">시작하기</Link>
        </ActionButton>
      </div>
    </main>
  );
}
