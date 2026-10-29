import { TeamAttendanceUploadPage } from '@/pages/team-attendance-upload';
import { Suspense } from 'react';

export const metadata = {
  title: '팀 세션 인증 사진 올리기 | YAPP+',
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TeamAttendanceUploadPage />
    </Suspense>
  );
}
