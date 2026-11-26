/** 서버 접수 응답과 제출 당시 명단만 표시한다. 직접 URL 진입은 Activity에서 차단한다. */
'use client';

import type { TeamAttendanceReceipt } from '@/features/team-attendance';
import { BackButton } from '@/app/navigation/back-button';
import { TabLink } from '@/app/navigation/tab-link';
import { CompleteIllustration } from '@/shared/ui/complete-illustration';
import { ActionButton, Text } from '@yapp-plus/ui';
import {
  body,
  bottomSection,
  confirmButton,
  container,
  description,
  graphicSection,
  header,
  headerSpacer,
  infoCard,
  infoDotLine,
  infoLabel,
  infoRow,
  infoValue,
  title,
  titleSection,
} from './team-attendance-complete-page.css';

/** 검증된 접수 응답과 당시 명단을 표시하며 출석 승인과 구분한다. */
export function TeamAttendanceCompletePage({ receipt }: { receipt: TeamAttendanceReceipt }) {
  return (
    <div className={container}>
      <header className={header}>
        <BackButton
          fallbackActivityName="Tabs"
          fallbackActivityParams={{ initialTab: 'home' }}
          iconOnly
        />
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
            <span className={infoValue}>{receipt.teamName}</span>
          </div>
          <div className={infoRow}>
            <span className={infoLabel}>업로드 시간</span>
            <span className={infoDotLine} aria-hidden="true" />
            <span className={infoValue}>
              {new Date(receipt.submittedAt).toLocaleString('ko-KR')}
            </span>
          </div>
          <div className={infoRow}>
            <span className={infoLabel}>참석 인원</span>
            <span className={infoDotLine} aria-hidden="true" />
            <span className={infoValue}>{receipt.members.length}명</span>
          </div>
          <div className={infoRow}>
            <span className={infoLabel}>참석자</span>
            <span className={infoDotLine} aria-hidden="true" />
            <span className={infoValue}>
              {receipt.members.map((member) => member.name).join(', ')}
            </span>
          </div>
        </section>
      </main>

      <footer className={bottomSection}>
        <ActionButton asChild variant="brandSolid" size="large" className={confirmButton}>
          <TabLink tab="home">확인</TabLink>
        </ActionButton>
      </footer>
    </div>
  );
}
