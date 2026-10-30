import { Badge, Box, HStack, Text } from '@seed-design/react';
import { ActionButton, ResultSection } from '@yapp-plus/ui';
import { Ellipsis, UserRound } from 'lucide-react';
import type { Member, MemberRole } from '~/features/member-management';
import type { MemberTeamMapping } from './member-team-filter';
import { partLabels } from '../model/member-search';
import * as styles from './member-list.css';

const roleLabels: Record<MemberRole, string> = {
  admin: '운영진',
  'active-member': '활동회원',
  'regular-member': '정회원',
};

const joinedDate = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function formatJoinedDate(value: string) {
  return joinedDate.format(new Date(value)).replaceAll(' ', '').replace(/\.$/, '');
}

export function MemberList({
  members,
  currentGeneration,
  hasMembers = false,
  teamMapping = 'before',
}: {
  members: readonly Member[];
  currentGeneration: number;
  hasMembers?: boolean;
  teamMapping?: MemberTeamMapping;
}) {
  const rows = members.flatMap((member) => {
    const activity = member.activities.find((item) => item.generation === currentGeneration);
    return activity ? [{ member, activity }] : [];
  });

  return (
    <section aria-label="회원 목록">
      <Text as="p" textStyle="t2Regular" color="fg.neutralMuted">
        총 <strong>{rows.length}</strong>명
      </Text>
      {rows.length === 0 ? (
        <Box py="x12">
          <ResultSection
            size="medium"
            asset={
              <Box aria-hidden="true" color="fg.neutralMuted" pb="x4">
                <UserRound size={40} />
              </Box>
            }
            titleAs="h2"
            title={hasMembers ? '검색 결과가 없어요' : '등록된 회원이 없어요'}
            description={
              hasMembers
                ? '이름이나 직군 조건을 변경해 주세요.'
                : '명단을 업로드하면 이곳에서 회원 정보를 확인할 수 있어요.'
            }
          />
        </Box>
      ) : (
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 좁은 화면에서 키보드로 표를 가로 스크롤하는 진입점이다.
        <section className={styles.scroll} aria-label="회원 목록 표" tabIndex={0}>
          <table className={styles.table}>
            <caption className={styles.caption}>{currentGeneration}기 회원 목록</caption>
            <thead>
              <tr>
                <th scope="col">이름 / 직군</th>
                <th scope="col" className={styles.role}>
                  권한
                </th>
                {teamMapping === 'after' && (
                  <th scope="col" className={styles.team}>
                    팀
                  </th>
                )}
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
              {rows.map(({ member, activity }) => (
                <tr key={member.id}>
                  <th scope="row">
                    <HStack gap="x2" flexWrap="wrap">
                      <Text className={styles.name} textStyle="t4Bold">
                        {member.name}
                      </Text>
                      <Badge variant="weak" tone="neutral">
                        {partLabels[activity.part]}
                      </Badge>
                      {activity.status === 'inactive' && (
                        <Badge variant="weak" tone="neutral">
                          비활동
                        </Badge>
                      )}
                      {member.activities.some((item) => item.generation < currentGeneration) && (
                        <Text textStyle="t1Regular" color="fg.neutralMuted">
                          {member.activities
                            .filter((item) => item.generation < currentGeneration)
                            .map((item) => item.generation)
                            .toSorted((a, b) => a - b)
                            .map((generation) => `${generation}기`)
                            .join(' · ')}{' '}
                          이력
                        </Text>
                      )}
                    </HStack>
                  </th>
                  <td>{roleLabels[activity.role]}</td>
                  {teamMapping === 'after' && (
                    <td>
                      {activity.team === null ? (
                        <Text textStyle="t1Regular" color="fg.neutralMuted">
                          팀 미배정
                        </Text>
                      ) : (
                        <HStack gap="x1_5" flexWrap="wrap">
                          <Badge variant="weak" tone="informative">
                            {activity.team.name}
                          </Badge>
                          {activity.team.isLeader && (
                            <Text textStyle="t1Regular" color="fg.neutralMuted">
                              팀장
                            </Text>
                          )}
                        </HStack>
                      )}
                    </td>
                  )}
                  <td>
                    <Text textStyle="t2Bold">
                      {activity.attendance.score === null
                        ? '미제공'
                        : `${activity.attendance.score}점`}
                    </Text>
                  </td>
                  <td>
                    <time dateTime={activity.joinedAt}>{formatJoinedDate(activity.joinedAt)}</time>
                  </td>
                  <td>
                    <ActionButton
                      variant="ghost"
                      size="small"
                      disabled
                      aria-label={`${member.name} 더보기 (준비 중)`}
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
    </section>
  );
}
