/** 개발 fixture를 목록·상세 읽기 화면으로 연결하며, API와 저장 상태를 소유하지 않습니다. */
import { ActivityLink } from '@/app/navigation/activity-link';
import { countDiningMembers, getDiningDeadline } from '../model/dining-model';
import { getDiningDevelopmentFixtures } from '../model/dining-fixtures.development';

/** DEV fixture의 회식 목록 또는 선택한 상세를 렌더링합니다. */
export function DiningPage({ diningId }: { diningId?: string }) {
  const fixtures = getDiningDevelopmentFixtures();
  if (!fixtures) {
    return (
      <main>
        <h1>회식</h1>
        <p>개발 환경에서만 회식 화면을 확인할 수 있어요.</p>
      </main>
    );
  }
  const dining = diningId
    ? Object.values(fixtures.scenarios).find(({ id }) => id === diningId)
    : null;
  if (diningId && !dining) {
    return (
      <main>
        <h1>회식</h1>
        <p>회식을 찾을 수 없어요.</p>
      </main>
    );
  }
  if (dining) {
    const count = countDiningMembers(dining.members);
    return (
      <main>
        <h1>{dining.title}</h1>
        <p>{dining.description}</p>
        <p>
          {getDiningDeadline(dining.surveyClosesAt, fixtures.now).label} · 참여 {count.ATTENDING}명
        </p>
        <ActivityLink activityName="DiningList" activityParams={{}}>
          목록으로
        </ActivityLink>
      </main>
    );
  }
  return (
    <main>
      <h1>회식</h1>
      <ul aria-label="회식 목록">
        {fixtures.list.map((item) => (
          <li key={item.id}>
            <article>
              <h2>
                <ActivityLink activityName="DiningDetail" activityParams={{ diningId: item.id }}>
                  {item.title}
                </ActivityLink>
              </h2>
              <p>
                {getDiningDeadline(item.surveyClosesAt, fixtures.now).label} · 참여{' '}
                {countDiningMembers(item.members).ATTENDING}명
              </p>
            </article>
          </li>
        ))}
      </ul>
    </main>
  );
}
