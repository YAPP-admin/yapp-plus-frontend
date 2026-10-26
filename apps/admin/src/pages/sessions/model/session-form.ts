/** 편집 중인 유형별 초안을 저장 계약으로 변환하고 공통 검증 규칙을 적용합니다. */
import { createSessionInputSchema, type CreateSessionInput, type SessionType } from './session';
import type { CoordinatesViewModel } from './location/location-view-model';

export type SessionFormValues = {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  type: SessionType;
  detailAddress: string;
  guide: string;
};

export function sessionFormDefaults(initial?: CreateSessionInput): SessionFormValues {
  return {
    name: initial?.name ?? '',
    date: initial?.date ?? '',
    startTime: initial?.startTime ?? '',
    endTime: initial?.endTime ?? '',
    type: initial?.type ?? 'offline',
    detailAddress: initial?.type === 'offline' ? initial.location.detailAddress : '',
    guide: initial?.type === 'team' ? initial.location.guide : '',
  };
}

/** 숨겨진 유형의 초안은 제출하지 않고, 스키마에서 공백과 일정·좌표를 검증합니다. */
export function parseSessionForm(
  value: SessionFormValues,
  roadAddress: string,
  position: CoordinatesViewModel | undefined,
) {
  return createSessionInputSchema.safeParse({
    name: value.name,
    date: value.date,
    startTime: value.startTime,
    endTime: value.endTime,
    type: value.type,
    location:
      value.type === 'team'
        ? { guide: value.guide }
        : {
            roadAddress,
            detailAddress: value.detailAddress,
            latitude: position?.latitude,
            longitude: position?.longitude,
          },
  });
}

/** 장소 오류는 장소 영역에, 일정 오류는 해당 입력에 연결합니다. */
export function sessionFormErrors(result: ReturnType<typeof parseSessionForm>) {
  if (result.success) {
    return undefined;
  }
  const fields: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0]);
    if (field === 'location') {
      fields.detailAddress = '주소를 선택하고 좌표 조회를 완료해 주세요.';
    } else {
      fields[field] = issue.message;
    }
  }
  return { fields };
}
