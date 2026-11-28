/** 홈 세션 응답의 장소·제목을 React 상태와 독립적인 표시 문구로 변환한다. */
import type { CurrentWeekSessionDetailResponse } from '@yapp-plus/api/generated';

/** 팀 세션은 자율 장소를 표시하고, 정규 세션의 비어 있는 장소는 기본 문구로 대체한다. */
export function getSessionVenue(
  session: Pick<CurrentWeekSessionDetailResponse, 'type' | 'location'> | null | undefined,
): string {
  if (session?.type === 'TEAM') {
    return '팀별 자율 장소';
  }
  const location = session?.location?.trim();
  return location?.length ? location : '장소 미정';
}

/** today는 한국 날짜 YYYY-MM-DD이며, 이름 끝의 세션을 제거해 중복 없이 제목을 만든다. */
export function getSessionTitle(
  session: Pick<CurrentWeekSessionDetailResponse, 'date' | 'name'> | null | undefined,
  today: string,
): string {
  if (!session) {
    return '이번 주 예정된 세션이 없어요';
  }
  const prefix = session.date === today ? '오늘은' : '이번 주는';
  const name = session.name
    .trim()
    .replace(/세션$/, '')
    .trim();
  return name ? `${prefix} ${name} 세션이에요` : `${prefix} 세션이 있어요`;
}
