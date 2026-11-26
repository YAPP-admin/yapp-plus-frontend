/** 계정과 활성 홈 진입의 수명을 분리해 결과 조회·표시·후속 이동을 연결합니다. */
import { focusManager } from '@tanstack/react-query';
import { useFlow } from '@stackflow/react';
import { useState, useSyncExternalStore } from 'react';
import { useNativeAuthSession } from '@/features/auth';
import { useScreenActiveContext } from '@/shared/lib/screen-activity';
import {
  createTeamAttendanceResultStorage,
  type TeamAttendanceResultStorage,
} from '../model/team-attendance-result-storage';
import { useTeamAttendanceResult } from '../model/use-team-attendance-result';
import { TeamAttendanceResultSheet } from './team-attendance-result-sheet';

const subscribeFocus = (notify: () => void) => focusManager.subscribe(notify);
const isFocused = () => focusManager.isFocused();

/** 인증된 계정만 조회합니다. 계정·로그인 세션 변경 시 메모리 표시 이력도 폐기합니다. */
export function TeamAttendanceResult() {
  const { session, phase } = useNativeAuthSession();
  return phase === 'SIGNED_IN' && session ? (
    <AccountResult key={`${session.userId}:${session.sessionId}`} userId={session.userId} />
  ) : null;
}

function AccountResult({ userId }: { userId: number }) {
  const [storage] = useState(createTeamAttendanceResultStorage);
  const active = useScreenActiveContext();
  const focused = useSyncExternalStore(subscribeFocus, isFocused, () => false);
  return active && focused ? <ResultEntry userId={userId} storage={storage} /> : null;
}

function ResultEntry({
  userId,
  storage,
}: {
  userId: number;
  storage: TeamAttendanceResultStorage;
}) {
  const { apiOptions } = useNativeAuthSession();
  const flow = useFlow();
  const [now] = useState(Date.now);
  const [dismissed, setDismissed] = useState(false);
  const query = useTeamAttendanceResult({ userId, storage, apiOptions, now, enabled: !dismissed });
  if (!query.result || dismissed) {
    return null;
  }
  return (
    <TeamAttendanceResultSheet
      result={query.result}
      open
      showSession={query.result.sessionId !== query.currentSessionId}
      onShown={query.markShown}
      onOpenChange={(open) => {
        if (!open) {
          setDismissed(true);
        }
      }}
      onReupload={(sessionId) => flow.push('TeamAttendanceGuide', { sessionId: String(sessionId) })}
      onContact={() => window.location.assign('https://pf.kakao.com/_aGxofd')}
    />
  );
}
