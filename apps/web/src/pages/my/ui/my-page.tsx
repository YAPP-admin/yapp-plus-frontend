import Image from 'next/image';
import Link from 'next/link';
import { AttendanceRulesDialog } from './attendance-rules-dialog';
import {
  activeChip,
  attendanceCard,
  avatar,
  cardHeader,
  cardStats,
  cardTitle,
  cardTitleGroup,
  container,
  menuChevron,
  menuItem,
  menuLabel,
  menuList,
  name,
  nameRow,
  profileInfo,
  profileRow,
  profileSection,
  questionButton,
  scoreGroup,
  scoreLabel,
  scoreValue,
  sectionDivider,
  statItem,
  statLabel,
  statValue,
  subDivider,
  subRow,
  subText,
} from './my-page.css';

type AttendanceStat = {
  label: string;
  value: number;
};

const ATTENDANCE_STATS: AttendanceStat[] = [
  { label: '출석', value: 3 },
  { label: '지각', value: 1 },
  { label: '결석', value: 0 },
  { label: '지각 면제권', value: 1 },
];

export function MyPage() {
  return (
    <div className={container}>
      <section className={profileSection} aria-label="프로필 및 출석 현황">
        <div className={profileRow}>
          <div className={avatar}>
            <Image
              src="/images/my/user-profile.svg"
              alt="김야뿌 프로필"
              width={66}
              height={66}
              priority
            />
          </div>
          <div className={profileInfo}>
            <div className={nameRow}>
              <span className={name}>김야뿌</span>
              <span className={activeChip}>활동회원</span>
            </div>
            <div className={subRow}>
              <span className={subText}>28기</span>
              <span className={subDivider} aria-hidden="true" />
              <span className={subText}>Designer</span>
            </div>
          </div>
        </div>

        <div className={attendanceCard} aria-label="내 출석 현황">
          <div className={cardHeader}>
            <div className={cardTitleGroup}>
              <span className={cardTitle}>내 출석 현황</span>
              <AttendanceRulesDialog>
                <button
                  type="button"
                  className={questionButton}
                  aria-label="출석 규칙 안내"
                  title="출석 규칙 안내"
                >
                  <Image src="/images/my/question.svg" alt="" width={20} height={20} />
                </button>
              </AttendanceRulesDialog>
            </div>
            <div className={scoreGroup}>
              <span className={scoreLabel}>총 점수</span>
              <span className={scoreValue}>92점</span>
            </div>
          </div>

          <div className={cardStats}>
            {ATTENDANCE_STATS.map((stat) => (
              <div key={stat.label} className={statItem}>
                <span className={statLabel}>{stat.label}</span>
                <span className={statValue}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className={sectionDivider} />

      <nav className={menuList} aria-label="마이페이지 메뉴">
        <Link href="/my/attendance" className={menuItem}>
          <span className={menuLabel}>출석 내역</span>
          <Image
            src="/images/my/chevron-right.svg"
            alt=""
            width={24}
            height={24}
            className={menuChevron}
          />
        </Link>
        <a
          href="https://pf.kakao.com/_xkxmxjxd"
          target="_blank"
          rel="noopener noreferrer"
          className={menuItem}
        >
          <span className={menuLabel}>이용문의</span>
          <Image
            src="/images/my/chevron-right.svg"
            alt=""
            width={24}
            height={24}
            className={menuChevron}
          />
        </a>
      </nav>
    </div>
  );
}
