'use client';

import Image from 'next/image';
import { BackButton } from '@/app/navigation/back-button';
import {
  container,
  content,
  description,
  graphic,
  graphicContainer,
  header,
  title,
  titleGroup,
} from './notice-error-page.css';

export type NoticeErrorPageProps = {
  titleText?: string;
  descriptionText?: string;
  fallbackUrl?: string;
};

export function NoticeErrorPage({
  titleText = '앗, 오류가 발생했어요!',
  descriptionText = '잠시 후 다시 시도해 주세요.',
  fallbackUrl = '/notices',
}: NoticeErrorPageProps) {
  return (
    <main className={container}>
      <header className={header}>
        <BackButton fallback={fallbackUrl} iconOnly />
      </header>

      <div className={content}>
        <div className={titleGroup}>
          <h1 className={title}>{titleText}</h1>
          <p className={description}>{descriptionText}</p>
        </div>

        <div className={graphicContainer}>
          <Image
            src="/images/notices/graphic-error.svg"
            alt=""
            width={350}
            height={170}
            className={graphic}
            priority
          />
        </div>
      </div>
    </main>
  );
}
