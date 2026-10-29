'use client';

import { BackButton } from '@/app/navigation/back-button';
import Image from 'next/image';
import {
  body,
  bottomSection,
  contactButton,
  container,
  description,
  graphicSection,
  header,
  headerSpacer,
  homeIndicatorArea,
  title,
  titleSection,
} from './login-error-page.css';

const KAKAO_INQUIRY_URL = 'https://pf.kakao.com/_xkxmxjxd';

export function LoginErrorPage() {
  return (
    <div className={container}>
      <header className={header}>
        <BackButton fallback="/login" iconOnly />
        <div className={headerSpacer} aria-hidden="true" />
      </header>

      <main className={body}>
        <section className={titleSection} aria-label="오류 안내">
          <h1 className={title}>앗, 문제가 발생했어요!</h1>
          <p className={description}>운영진에게 문의하면 빠르게 해결할 수 있어요</p>
        </section>

        <section className={graphicSection} aria-hidden="true">
          <Image src="/images/notices/graphic-error.svg" alt="" width={350} height={170} priority />
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
        <div className={homeIndicatorArea} aria-hidden="true" />
      </footer>
    </div>
  );
}
