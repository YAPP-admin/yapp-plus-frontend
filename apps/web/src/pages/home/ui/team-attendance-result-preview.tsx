/** 개발 경로에서 결과 시트만 검증합니다. 실제 문의·재제출·로컬 기록은 실행하지 않습니다. */
import { useState } from 'react';
import { ActionButton } from '@yapp-plus/ui';
import { TEAM_ATTENDANCE_RESULT_FIXTURES } from '../model/team-attendance-result-fixtures';
import { TeamAttendanceResultSheet } from './team-attendance-result-sheet';

/** 개발 빌드의 상위 Activity에서만 로드하는 미리보기입니다. */
export function TeamAttendanceResultPreview() {
  const [selected, setSelected] = useState<string>(TEAM_ATTENDANCE_RESULT_FIXTURES[0].label);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('');
  const fixture =
    TEAM_ATTENDANCE_RESULT_FIXTURES.find(({ label }) => label === selected) ??
    TEAM_ATTENDANCE_RESULT_FIXTURES[0];
  return (
    <section>
      <h2>팀 세션 결과 시트 미리보기</h2>
      <p>화면만 확인하며 실제 출결·표시 이력은 바뀌지 않습니다.</p>
      {TEAM_ATTENDANCE_RESULT_FIXTURES.map(({ label }) => (
        <ActionButton
          key={label}
          variant="neutralWeak"
          onClick={() => {
            setSelected(label);
            setOpen(true);
            setAction('');
          }}
        >
          {label}
        </ActionButton>
      ))}
      <output>{action}</output>
      <TeamAttendanceResultSheet
        result={fixture.result}
        showSession={fixture.showSession}
        open={open}
        onOpenChange={setOpen}
        onReupload={(sessionId) => setAction(`${sessionId}번 세션 재업로드 선택`)}
        onContact={() => setAction('운영진 문의 선택')}
      />
    </section>
  );
}
