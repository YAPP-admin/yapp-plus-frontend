'use client';

import {
  DialogAction,
  DialogBackdrop,
  DialogContent,
  DialogPositioner,
  DialogRoot,
  DialogTrigger,
} from '@seed-design/react';
import type { ReactNode } from 'react';
import {
  backdrop,
  confirmButton,
  content,
  dottedLine,
  header,
  noteBox,
  noteBullet,
  noteItem,
  positioner,
  ruleGroup,
  ruleGroups,
  ruleLabel,
  ruleRow,
  ruleRowIndented,
  ruleScore,
  title,
} from './attendance-rules-dialog.css';

type AttendanceRulesDialogProps = {
  children: ReactNode;
};

export function AttendanceRulesDialog({ children }: AttendanceRulesDialogProps) {
  return (
    <DialogRoot>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogBackdrop className={backdrop} />
      <DialogPositioner className={positioner}>
        <DialogContent className={content}>
          <div className={header}>
            <h2 className={title}>출석 규칙</h2>
            <div className={ruleGroups}>
              {/* 그룹 1: 1시간 지각/조퇴 */}
              <div className={ruleGroup}>
                <div className={ruleRow}>
                  <span className={ruleLabel}>1시간 지각/조퇴</span>
                  <span className={dottedLine} aria-hidden="true" />
                  <span className={ruleScore}>-4점</span>
                </div>
                <div className={ruleRowIndented}>
                  <span className={ruleLabel}>무단 지각</span>
                  <span className={dottedLine} aria-hidden="true" />
                  <span className={ruleScore}>-10점</span>
                </div>
              </div>

              {/* 그룹 2: 3시간 지각/조퇴 */}
              <div className={ruleGroup}>
                <div className={ruleRow}>
                  <span className={ruleLabel}>3시간 지각/조퇴</span>
                  <span className={dottedLine} aria-hidden="true" />
                  <span className={ruleScore}>-8점</span>
                </div>
                <div className={ruleRowIndented}>
                  <span className={ruleLabel}>무단 지각</span>
                  <span className={dottedLine} aria-hidden="true" />
                  <span className={ruleScore}>-14점</span>
                </div>
              </div>

              {/* 그룹 3: 결석 */}
              <div className={ruleGroup}>
                <div className={ruleRow}>
                  <span className={ruleLabel}>결석</span>
                  <span className={dottedLine} aria-hidden="true" />
                  <span className={ruleScore}>-12점</span>
                </div>
                <div className={ruleRowIndented}>
                  <span className={ruleLabel}>무단 결석</span>
                  <span className={dottedLine} aria-hidden="true" />
                  <span className={ruleScore}>-20점</span>
                </div>
              </div>
            </div>

            {/* 안내사항 박스 */}
            <div className={noteBox}>
              <p className={noteItem}>
                <span className={noteBullet}>•</span>
                <span>총 40점 미만의 회원은 운영진 심의 하에 제명될 수 있습니다.</span>
              </p>
              <p className={noteItem}>
                <span className={noteBullet}>•</span>
                <span>
                  결석은 특수한 사유가 아닌 한 세션 시작 2일 전까지 사전 보고가 가능하며, 특수한
                  경우 1회에 한하여 구제될 수 있습니다.
                </span>
              </p>
            </div>
          </div>

          <DialogAction asChild>
            <button type="button" className={confirmButton}>
              확인
            </button>
          </DialogAction>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
