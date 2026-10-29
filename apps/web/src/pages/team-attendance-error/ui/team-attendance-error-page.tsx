'use client';

import { BackButton } from '@/app/navigation/back-button';
import { ActionButton, Text } from '@yapp-plus/ui';
import Image from 'next/image';
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
} from './team-attendance-error-page.css';

export function TeamAttendanceErrorPage() {
  return (
    <div className={container}>
      <header className={header}>
        <BackButton fallback="/" iconOnly />
        <div className={headerSpacer} aria-hidden="true" />
      </header>

      <main className={body}>
        <section className={titleSection} aria-label="오류 안내">
          <Text as="h1" className={title}>
            인증 사진을 업로드하지 못했어요
          </Text>
          <Text as="p" className={description}>
            {'네트워크 상태를 확인하고 다시 시도해 주세요\n10MB 이하의 사진만 업로드할 수 있어요'}
          </Text>
        </section>

        <section className={graphicSection} aria-hidden="true">
          <Image src="/images/notices/graphic-error.svg" alt="" width={350} height={170} priority />
        </section>
      </main>

      <footer className={bottomSection}>
        <ActionButton asChild variant="brandSolid" size="large" className={confirmButton}>
          <Link href="/">확인</Link>
        </ActionButton>
        <div className={homeIndicatorArea} aria-hidden="true" />
      </footer>
    </div>
  );
}
