'use client';

/** 인증 오류와 문의 경로를 표시하고 제한 계정은 정리 성공 후 로그인으로 복귀합니다. */
import { useState } from 'react';
import { useFlow } from '@stackflow/react';
import { IconChevronLeftLine } from '@karrotmarket/react-monochrome-icon';
import { ActionButton, Icon } from '@yapp-plus/ui';
import { useNativeAuthSession, useNativeSignOutMutation } from '@/features/auth';
import { iconBackButton } from '@/app/navigation/back-button.css';
import { BackButton } from '@/app/navigation/back-button';
import { Image } from '@/app/navigation/image';
import {
  body,
  bottomSection,
  contactButton,
  container,
  description,
  graphicSection,
  header,
  headerSpacer,
  title,
  titleSection,
} from './login-error-page.css';

const KAKAO_INQUIRY_URL = 'https://pf.kakao.com/_aGxofd';

/** 문의 링크는 유지하며 native 제한 상태의 복귀는 로컬 정리가 끝날 때까지 기다립니다. */
export function LoginErrorPage() {
  const { isNative, phase } = useNativeAuthSession();
  const [failed, setFailed] = useState(false);
  return (
    <div className={container}>
      <header className={header}>
        {isNative && phase === 'REVIEW_REQUIRED' ? (
          <ReviewBackButton onFailureChange={setFailed} />
        ) : (
          <BackButton fallbackActivityName="Login" fallbackActivityParams={{}} iconOnly />
        )}
        <div className={headerSpacer} aria-hidden="true" />
      </header>

      <main className={body}>
        {failed && <p role="alert">로그인 화면으로 돌아가지 못했어요. 다시 시도해 주세요.</p>}
        <section className={titleSection} aria-label="오류 안내">
          <h1 className={title}>앗, 문제가 발생했어요!</h1>
          <p className={description}>운영진에게 문의하면 빠르게 해결할 수 있어요</p>
        </section>

        <section className={graphicSection} aria-hidden="true">
          <Image
            src="/images/notices/graphic-error.svg"
            alt=""
            width={350}
            height={170}
            fetchPriority="high"
          />
        </section>
      </main>

      <footer className={bottomSection}>
        <a
          href={KAKAO_INQUIRY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={contactButton}
        >
          운영진에게 문의하기
        </a>
      </footer>
    </div>
  );
}

function ReviewBackButton({ onFailureChange }: { onFailureChange: (failed: boolean) => void }) {
  const flow = useFlow();
  const mutation = useNativeSignOutMutation({
    onSignedOut: () => flow.replace('Login', {}),
    onFailure: () => onFailureChange(true),
  });
  return (
    <ActionButton
      type="button"
      className={iconBackButton}
      variant="ghost"
      size="medium"
      layout="iconOnly"
      aria-label="뒤로가기"
      disabled={mutation.isPending}
      loading={mutation.isPending}
      onClick={() => {
        onFailureChange(false);
        mutation.mutate(undefined);
      }}
    >
      <Icon svg={<IconChevronLeftLine />} />
    </ActionButton>
  );
}
