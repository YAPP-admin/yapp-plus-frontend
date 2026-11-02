import { AppScreen, AppScreenContent } from '../../../seed-design/ui/app-screen';
import { AppBar, AppBarBackButton, AppBarMain } from '../../../seed-design/ui/app-bar';
import { Link } from '@stackflow/link/future';
import { useFlow } from '@stackflow/react/future';
import { useState, type ReactNode } from 'react';
import { useAppScreenOptions } from '../platform';

export function AttendanceActivity() {
  return (
    <Phase6Screen title="출석 내역">
      <p>최근 출석 기록과 출석 규칙을 확인할 수 있습니다.</p>
      <Link activityName="AttendanceRules" activityParams={{}} data-testid="attendance-rules-link">
        출석 규칙 보기
      </Link>
      <Link
        activityName="AttendanceComplete"
        activityParams={{}}
        data-testid="attendance-complete-link"
      >
        출석 완료 화면 열기
      </Link>
    </Phase6Screen>
  );
}

export function AttendanceRulesActivity() {
  return (
    <Phase6Screen title="출석 규칙">
      <p>세션 시작 전 출석·지각·결석 처리 기준을 확인합니다.</p>
      <ul>
        <li>세션 시작 후 10분 이내는 출석으로 처리합니다.</li>
        <li>사전 출결보고는 세션 시작 전에 제출해야 합니다.</li>
      </ul>
    </Phase6Screen>
  );
}

export function AttendanceCompleteActivity() {
  return (
    <Phase6Screen title="출석 완료" preventSwipeBack>
      <p>출석이 완료되었습니다.</p>
      <Link
        activityName="Tabs"
        activityParams={{ initialTab: 'home' }}
        data-testid="attendance-home-link"
      >
        홈으로 돌아가기
      </Link>
    </Phase6Screen>
  );
}

export function SettingsActivity() {
  return (
    <Phase6Screen title="설정">
      <p>알림과 계정 설정을 관리합니다.</p>
      <button type="button" data-testid="settings-notification-toggle">
        알림 설정
      </button>
    </Phase6Screen>
  );
}

export function TeamAttendanceUploadActivity() {
  const flow = useFlow();
  const [fileName, setFileName] = useState('');

  return (
    <Phase6Screen title="팀 세션 인증 사진 올리기" preventSwipeBack>
      <p>팀 세션 인증 사진을 선택한 뒤 제출합니다.</p>
      <label>
        인증 사진
        <input
          type="file"
          accept="image/*"
          data-testid="team-upload-file"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')}
        />
      </label>
      <output data-testid="team-upload-file-name">{fileName || '선택된 파일 없음'}</output>
      <button
        type="button"
        disabled={!fileName}
        data-testid="team-upload-submit"
        onClick={() => flow.push('TeamAttendanceComplete', {}, { animate: false })}
      >
        제출하기
      </button>
      <button
        type="button"
        data-testid="team-upload-error"
        onClick={() => flow.push('TeamAttendanceError', {}, { animate: false })}
      >
        오류 상태 보기
      </button>
    </Phase6Screen>
  );
}

export function TeamAttendanceErrorActivity() {
  return (
    <Phase6Screen title="팀 세션 인증 오류" preventSwipeBack>
      <p>사진을 업로드하지 못했습니다. 다시 시도해 주세요.</p>
      <Link
        activityName="TeamAttendanceUpload"
        activityParams={{}}
        data-testid="team-error-retry-link"
      >
        다시 시도하기
      </Link>
      <Link
        activityName="Tabs"
        activityParams={{ initialTab: 'home' }}
        data-testid="team-error-home-link"
      >
        홈으로 돌아가기
      </Link>
    </Phase6Screen>
  );
}

export function TeamAttendanceCompleteActivity() {
  return (
    <Phase6Screen title="팀 세션 인증 완료" preventSwipeBack>
      <p>팀 세션 인증 사진을 제출했습니다.</p>
      <Link
        activityName="Tabs"
        activityParams={{ initialTab: 'home' }}
        data-testid="team-complete-home-link"
      >
        홈으로 돌아가기
      </Link>
    </Phase6Screen>
  );
}

function Phase6Screen({
  children,
  preventSwipeBack,
  title,
}: {
  children: ReactNode;
  preventSwipeBack?: boolean;
  title: string;
}) {
  const appScreenOptions = useAppScreenOptions();

  return (
    <AppScreen {...appScreenOptions} preventSwipeBack={preventSwipeBack}>
      <AppScreenContent>
        <AppBar>
          <AppBarBackButton />
          <AppBarMain title={title} />
        </AppBar>
        <main className="spike-content spike-phase6-content">
          <h1>{title}</h1>
          {children}
        </main>
      </AppScreenContent>
    </AppScreen>
  );
}
