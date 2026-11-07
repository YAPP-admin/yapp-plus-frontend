/** 개발 경로와 개발 빌드 전용 검증 도구를 제공한다. 위치 도구는 화면 이탈 시 폐기한다. */

import { lazy, Suspense } from 'react';
import { content, description, title } from '../../../shared/ui/page.css';
import { link, links } from '../../../shared/ui/page-links.css';

// 프로덕션 번들에는 위치 검증 화면과 전용 훅을 포함하지 않는다.
const LocationCheck = import.meta.env.DEV
  ? lazy(() => import('./location-check').then((module) => ({ default: module.LocationCheck })))
  : null;

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

/** Stackflow의 활성 상태를 받아 숨겨진 화면의 위치 결과 반영을 차단한다. */
export function DevRoutesPage({ isActive = true }: { isActive?: boolean }) {
  return (
    <main className={content}>
      <h1 className={title}>개발용 화면 목록</h1>
      <p className={description}>
        로컬 개발에서 페이지 경로를 확인하는 목록입니다. 실제 공지·회원 정보나 가입 결과를 제공하지
        않습니다.
      </p>
      {isActive && LocationCheck && (
        <Suspense fallback={<output>위치 도구를 준비하고 있습니다.</output>}>
          <LocationCheck />
        </Suspense>
      )}
      <nav className={links} aria-label="개발용 화면 목록">
        {routes.map(({ href, label }) => (
          <a key={href} className={link} href={href}>
            {label}
          </a>
        ))}
      </nav>
    </main>
  );
}
