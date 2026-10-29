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
  infoCard,
  infoDotLine,
  infoLabel,
  infoRow,
  infoValue,
  title,
  titleSection,
} from './team-attendance-complete-page.css';

export function TeamAttendanceCompletePage() {
  return (
    <div className={container}>
      <header className={header}>
        <BackButton fallback="/" iconOnly />
        <div className={headerSpacer} aria-hidden="true" />
      </header>

      <main className={body}>
        <section className={titleSection} aria-label="인증 완료 안내">
          <Text as="h1" className={title}>
            인증 사진을 올렸어요!
          </Text>
          <Text as="p" className={description}>
            운영진이 승인하면 출석이 완료돼요
          </Text>
        </section>

        <section className={graphicSection} aria-hidden="true">
          <CompleteIllustration />
        </section>

        <section className={infoCard} aria-label="제출 정보">
          <div className={infoRow}>
            <span className={infoLabel}>팀</span>
            <span className={infoDotLine} aria-hidden="true" />
            <span className={infoValue}>Web 4팀 채소집</span>
          </div>
          <div className={infoRow}>
            <span className={infoLabel}>업로드 시간</span>
            <span className={infoDotLine} aria-hidden="true" />
            <span className={infoValue}>14:25</span>
          </div>
          <div className={infoRow}>
            <span className={infoLabel}>참석 인원</span>
            <span className={infoDotLine} aria-hidden="true" />
            <span className={infoValue}>4 / 5명</span>
          </div>
          <div className={infoRow}>
            <span className={infoLabel}>참석자</span>
            <span className={infoDotLine} aria-hidden="true" />
            <span className={infoValue}>강야뿌, 김야뿌, 이야뿌, 최야뿌</span>
          </div>
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
