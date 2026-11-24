import { useEffect, useRef } from 'react';
import { Box, HStack, Text } from '@seed-design/react';
import { ActionButton, Badge, ResultSection } from '@yapp-plus/ui';
import { Ellipsis, UserRound } from 'lucide-react';
import type { AdminMemberItemResponse } from '@yapp-plus/api/generated';
import { formatMemberDate, memberPositionLabels, memberStatusLabels } from '../model/member-api';
import * as styles from './member-list.css';

export function ApiMemberList({
  members,
  generationNumber,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
  onEdit,
}: {
  members: readonly AdminMemberItemResponse[];
  generationNumber: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
  onEdit: (memberId: number) => void;
}) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (
      target === null ||
      !hasNextPage ||
      isFetchingNextPage ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        onFetchNextPage();
      }
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onFetchNextPage]);

  return (
    <section aria-label="회원 목록">
      <Text as="p" textStyle="t2Regular" color="fg.neutralMuted">
        총 <strong>{members.length}</strong>명
      </Text>
      {members.length === 0 ? (
        <Box py="x12">
          <ResultSection
            size="medium"
            asset={
              <Box aria-hidden="true" color="fg.neutralMuted" pb="x4">
                <UserRound size={40} />
              </Box>
            }
            titleAs="h2"
            title="검색 결과가 없어요"
            description="이름이나 직군, 팀 조건을 변경해 주세요."
          />
        </Box>
      ) : (
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 좁은 화면에서 키보드로 표를 가로 스크롤하는 진입점이다.
        <section className={styles.scroll} aria-label="회원 목록 표" tabIndex={0}>
          <table className={styles.table}>
            <caption className={styles.caption}>{generationNumber}기 회원 목록</caption>
            <thead>
              <tr>
                <th scope="col">이름 / 직군</th>
                <th scope="col" className={styles.role}>
                  권한
                </th>
                <th scope="col" className={styles.team}>
                  팀
                </th>
                <th scope="col" className={styles.score}>
                  출석 점수
                </th>
                <th scope="col" className={styles.date}>
                  가입일
                </th>
                <th scope="col" className={styles.more}>
                  <span className={styles.caption}>회원 작업</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.memberId}>
                  <th scope="row">
                    <HStack gap="x2" flexWrap="wrap">
                      <Text className={styles.name} textStyle="t4Bold">
                        {member.name}
                      </Text>
                      <Badge variant="weak" tone="neutral">
                        {member.position === null
                          ? '직군 미지정'
                          : memberPositionLabels[member.position]}
                      </Badge>
                      {member.previousActivities.length > 0 && (
                        <Text textStyle="t1Regular" color="fg.neutralMuted">
                          {member.previousActivities
                            .map((activity) => activity.generationNumber)
                            .toSorted((a, b) => a - b)
                            .map((generation) => `${generation}기`)
                            .join(' · ')}{' '}
                          이력
                        </Text>
                      )}
                    </HStack>
                  </th>
                  <td>{memberStatusLabels[member.status]}</td>
                  <td>{member.teamName ?? '팀 미배정'}</td>
                  <td>
                    <Text textStyle="t2Bold">
                      {member.attendanceScore === null ? '미제공' : `${member.attendanceScore}점`}
                    </Text>
                  </td>
                  <td>
                    <time dateTime={member.signedUpDate}>
                      {formatMemberDate(member.signedUpDate)}
                    </time>
                  </td>
                  <td>
                    <ActionButton
                      variant="ghost"
                      size="small"
                      aria-label={`${member.name} 더보기`}
                      onClick={() => onEdit(member.memberId)}
                    >
                      <Ellipsis size={20} aria-hidden="true" />
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      <div ref={loadMoreRef} aria-hidden="true" />
      {isFetchingNextPage ? (
        <output className={styles.caption}>다음 회원을 불러오는 중입니다.</output>
      ) : null}
    </section>
  );
}
