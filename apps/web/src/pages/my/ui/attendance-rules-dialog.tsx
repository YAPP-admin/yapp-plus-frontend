'use client';

import {
  Box,
  Portal,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogAction,
  DialogBackdrop,
  DialogContent,
  DialogPositioner,
  DialogRoot,
  DialogTrigger,
  HStack,
  Text,
  VStack,
} from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
import type { ReactNode } from 'react';
import {
  backdrop,
  confirmButton,
  content,
  dottedLine,
  positioner,
} from './attendance-rules-dialog.css';

const attendanceRuleGroups = [
  {
    rows: [
      ['1시간 지각/조퇴', '-4점'],
      ['무단 지각', '-10점'],
    ],
  },
  {
    rows: [
      ['3시간 지각/조퇴', '-8점'],
      ['무단 지각', '-14점'],
    ],
  },
  {
    rows: [
      ['결석', '-12점'],
      ['무단 결석', '-20점'],
    ],
  },
] as const;

const attendanceNotes = [
  '총 40점 미만의 회원은 운영진 심의 하에 제명될 수 있습니다.',
  '결석은 특수한 사유가 아닌 한 세션 시작 2일 전까지 사전 보고가 가능하며, 특수한 경우 1회에 한하여 구제될 수 있습니다.',
] as const;

type AttendanceRulesDialogProps = {
  children: ReactNode;
};

export function AttendanceRulesDialog({ children }: AttendanceRulesDialogProps) {
  return (
    <DialogRoot>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <Portal>
        <DialogBackdrop className={backdrop} />
        <DialogPositioner className={positioner}>
          <DialogContent width="full" maxWidth="346px" className={content}>
            <DialogHeader>
              <DialogTitle asChild>
                <Text as="h2" textStyle="t6Bold" color="fg.neutral">
                  출석 규칙
                </Text>
              </DialogTitle>
            </DialogHeader>
            <DialogBody>
              <VStack as="ul" gap="x3_5" p="0px" m="0px">
                {attendanceRuleGroups.map((group) => (
                  <VStack as="li" key={group.rows[0][0]} gap="x1">
                    {group.rows.map(([label, score], index) => (
                      <HStack
                        key={label}
                        align="center"
                        gap="x3"
                        width="full"
                        paddingLeft={index === 1 ? 'x2' : undefined}
                      >
                        <Text textStyle="t4Regular" fontWeight="medium" color="fg.neutralSubtle">
                          {label}
                        </Text>
                        <Box className={dottedLine} aria-hidden="true" />
                        <Text textStyle="t4Bold" color="fg.brand" whiteSpace="nowrap">
                          {score}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                ))}
              </VStack>
              <VStack as="ul" gap="x1" bg="bg.neutralWeak" borderRadius="r2" px="x3_5" py="x3">
                {attendanceNotes.map((note) => (
                  <HStack as="li" key={note} align="flex-start" gap="x1">
                    <Text
                      as="span"
                      textStyle="t3Regular"
                      fontWeight="medium"
                      color="fg.neutralSubtle"
                    >
                      •
                    </Text>
                    <Text textStyle="t3Regular" fontWeight="medium" color="fg.neutralSubtle">
                      {note}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </DialogBody>
            <DialogFooter>
              <DialogAction asChild>
                <ActionButton
                  type="button"
                  variant="brandSolid"
                  size="medium"
                  className={confirmButton}
                >
                  확인
                </ActionButton>
              </DialogAction>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </DialogRoot>
  );
}
