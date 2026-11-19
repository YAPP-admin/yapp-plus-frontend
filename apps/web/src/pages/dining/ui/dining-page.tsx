/** 개발 fixture의 목록·상세 화면을 선택하고, 각 화면 구현은 전용 모듈에 위임합니다. */
import { Text } from '@yapp-plus/ui';
import { getDiningDevelopmentFixtures } from '../model/dining-fixtures.development';
import { DiningDetailPage } from './dining-detail-page';
import { DiningListPage } from './dining-list-page';
import { page } from './dining-list-page.css';

/** DEV fixture의 회식 목록 또는 선택한 상세 화면을 렌더링합니다. */
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

  return dining ? (
    <DiningDetailPage dining={dining} now={fixtures.now} />
  ) : (
    <DiningListPage items={fixtures.list} now={fixtures.now} />
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
