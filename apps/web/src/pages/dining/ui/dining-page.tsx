/** 개발 fixture의 목록과 기본 상세 정보를 연결하며, API와 저장 상태를 소유하지 않습니다. */
import { ActivityLink } from '@/app/navigation/activity-link';
import { Text } from '@yapp-plus/ui';
import { getDiningDevelopmentFixtures } from '../model/dining-fixtures.development';
import { countDiningMembers, getDiningDeadline } from '../model/dining-model';
import { DiningListPage } from './dining-list-page';
import { page } from './dining-list-page.css';

/** DEV fixture의 회식 목록 또는 선택한 기본 상세 정보를 렌더링합니다. */
export function DiningPage({ diningId }: { diningId?: string }) {
  const fixtures = getDiningDevelopmentFixtures();
  if (!fixtures) {
    return <DiningMessage>개발 환경에서만 뒤풀이 화면을 확인할 수 있어요.</DiningMessage>;
  }

  const dining = diningId
    ? Object.values(fixtures.scenarios).find(({ id }) => id === diningId)
    : undefined;
  if (diningId && !dining) {
    return <DiningMessage>뒤풀이를 찾을 수 없어요.</DiningMessage>;
  }

  if (!dining) {
    return <DiningListPage items={fixtures.list} now={fixtures.now} />;
  }

  const deadline = getDiningDeadline(dining.surveyClosesAt, fixtures.now);
  const count = countDiningMembers(dining.members);
  return (
    <main className={page}>
      <Text as="h1" textStyle="t8Bold">
        {dining.title}
      </Text>
      <Text as="p" textStyle="t4Regular">
        {dining.description}
      </Text>
      <Text as="p" textStyle="t3Medium">
        {deadline.label} · 참여 {count.RESPONDED}명
      </Text>
      <ActivityLink activityName="DiningList" activityParams={{}}>
        목록으로
      </ActivityLink>
    </main>
  );
}

function DiningMessage({ children }: { children: string }) {
  return (
    <main className={page}>
      <Text as="p" textStyle="t4Regular">
        {children}
      </Text>
    </main>
  );
}
