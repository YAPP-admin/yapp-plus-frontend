import { body, heading, screen } from '@/shared/ui/step-screen.css';
import { Text } from '@yapp-plus/ui';
import Image from 'next/image';
import { graphic, illustration } from './signup-status-page.css';

// 피그마 Sign-up_waiting. 거절 상태는 시안이 없어 승인 대기만 표시합니다.
export function SignupStatusPage() {
  return (
    <main className={screen}>
      <div className={body}>
        <div className={heading}>
          <Text as="h1" textStyle="t10Bold" color="fg.neutral">
            운영진 승인을 기다리고 있어요...
          </Text>
          <Text as="p" textStyle="t5Regular" color="fg.neutralMuted">
            승인 완료까지 잠시만 기다려 주세요
          </Text>
        </div>
        <div className={graphic}>
          <Image
            src="/images/signup-waiting.svg"
            alt=""
            width={353}
            height={180}
            className={illustration}
          />
        </div>
      </div>
    </main>
  );
}
