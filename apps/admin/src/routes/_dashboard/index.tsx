import { Navigate, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/')({
  // 대시보드 페이지는 운영 메뉴에서 임시로 숨깁니다. 필요할 때 이 라우트를 복원합니다.
  staticData: { navigation: { menu: 'sessions', pageLabel: '세션 목록' } },
  component: () => <Navigate to="/sessions" replace />,
});
