import { HStack, VStack } from '@seed-design/react';
import type { MyAttendanceScoreResponse } from '@yapp-plus/api/generated';
import type { ReactNode } from 'react';
import { scoreLabel, scoreValue, statItem, statLabel, statValue } from './my-page.css';

export function ScoreSummary({
  score,
  notice,
}: {
  score?: MyAttendanceScoreResponse;
  notice?: ReactNode;
}) {
  const stats = [
    { label: '출석', value: score?.attendanceCount ?? '—' },
    { label: '지각', value: score?.lateCount ?? '—' },
    { label: '결석', value: score?.absentCount ?? '—' },
    { label: '지각 면제권', value: '—' },
  ];
  return (
    <>
      <HStack
        gridColumn="2"
        gridRow="1"
        py="x2"
        pr="x4"
        bg="bg.neutralMuted"
        align="center"
        gap="x1_5"
      >
        <span className={scoreLabel}>총 점수</span>
        <span className={scoreValue}>{score ? `${score.totalScore}점` : '—'}</span>
      </HStack>
      {notice}
      <HStack
        gridColumn="1 / -1"
        align="center"
        p="x1"
        gap="x1"
        bg="bg.layerDefault"
        borderBottomLeftRadius="r2"
        borderBottomRightRadius="r2"
      >
        {stats.map((stat) => (
          <VStack
            key={stat.label}
            className={statItem}
            grow
            align="center"
            justify="center"
            py="x3"
            gap="x1"
            borderRadius="r2"
          >
            <span className={statLabel}>{stat.label}</span>
            <span className={statValue}>{stat.value}</span>
          </VStack>
        ))}
      </HStack>
    </>
  );
}
