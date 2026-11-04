/** 팀 매핑 초안의 로컬 종료 확인 overlay를 연다. */
import { overlay } from 'overlay-kit';
import { TeamLeaveDialog } from './team-leave-dialog';

/** 변경이 있을 때만 로컬 이탈 확인을 열고, 확인 결과에 따라 종료한다. */
export function useTeamLeaveGuard({ dirty, onLeave }: { dirty: boolean; onLeave: () => void }) {
  function requestLeave() {
    if (!dirty) {
      onLeave();
      return;
    }

    void overlay
      .openAsync<boolean>(({ isOpen, close, unmount }) => (
        <TeamLeaveDialog
          open={isOpen}
          onKeepEditing={() => {
            close(false);
            unmount();
          }}
          onDiscard={() => {
            close(true);
            unmount();
          }}
        />
      ))
      .then((shouldLeave) => {
        if (shouldLeave) {
          onLeave();
        }

        return shouldLeave;
      });
  }

  return { requestLeave };
}
