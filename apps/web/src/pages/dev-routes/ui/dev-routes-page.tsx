import Link from 'next/link';
import { content, description, title } from '../../../shared/ui/page.css';
import { link, links } from '../../../shared/ui/page-links.css';

const routes = [
  { href: '/', label: '홈' },
  { href: '/?session=team', label: '홈 (팀 세션)' },
  { href: '/schedule', label: '일정' },
  { href: '/notices', label: '공지 목록' },
  { href: '/notices/123', label: '공지 상세 (예시 ID: 123)' },
  { href: '/my', label: '마이페이지' },
  { href: '/my/attendance', label: '출석 내역' },
  { href: '/my/attendance/rules', label: '출석 규칙' },
  { href: '/settings', label: '설정' },
  { href: '/alerts', label: '알림' },
  { href: '/attendance/complete', label: '출석 완료' },
  { href: '/team-attendance/upload', label: '팀 세션 인증 사진 올리기' },
  { href: '/team-attendance/complete', label: '팀 세션 인증 완료' },
  { href: '/team-attendance/error', label: '팀 세션 인증 오류' },
  { href: '/login', label: '로그인' },
  { href: '/login/error', label: '로그인 오류' },
  { href: '/signup', label: '추가 정보 입력' },
  { href: '/signup/status', label: '가입 승인 상태' },
  { href: '/signup/complete', label: '가입 완료' },
  { href: '/signup/unregistered', label: '미등록 회원 안내' },
];

export function DevRoutesPage() {
  return (
    <main className={content}>
      <h1 className={title}>개발용 화면 목록</h1>
      <p className={description}>
        로컬 개발에서 페이지 경로를 확인하는 목록입니다. 실제 공지·회원 정보나 가입 결과를 제공하지
        않습니다.
      </p>
      <nav className={links} aria-label="개발용 화면 목록">
        {routes.map(({ href, label }) => (
          <Link key={href} className={link} href={href}>
            {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
