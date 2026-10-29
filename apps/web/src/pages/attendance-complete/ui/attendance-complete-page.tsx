'use client';

import { BackButton } from '@/app/navigation/back-button';
import { CompleteIllustration } from '@/pages/signup-complete/ui/complete-illustration';
import { ActionButton, Text } from '@yapp-plus/ui';
import Link from 'next/link';
import {
  body,
  bottomSection,
  confirmButton,
  container,
  description,
  graphicSection,
  header,
  headerSpacer,
  homeIndicatorArea,
  title,
  titleSection,
} from './attendance-complete-page.css';

export function AttendanceCompletePage() {
  return (
    <div className={container}>
      <header className={header}>
        <BackButton fallback="/?attendance=attended" iconOnly />
        <div className={headerSpacer} aria-hidden="true" />
      </header>

      <main className={body}>
        <section className={titleSection} aria-label="출석 완료 안내">
          <Text as="h1" className={title}>
            출석을 완료했어요!
          </Text>
          <Text as="p" className={description}>
            출석 내역은 마이페이지에서 확인할 수 있어요
          </Text>
        </section>

        <section className={graphicSection} aria-hidden="true">
          <CompleteIllustration />
        </section>
      </main>

      <footer className={bottomSection}>
        <ActionButton asChild variant="brandSolid" size="large" className={confirmButton}>
          <Link href="/?attendance=attended">확인</Link>
        </ActionButton>
        <div className={homeIndicatorArea} aria-hidden="true" />
      </footer>
    </div>
  );
}
