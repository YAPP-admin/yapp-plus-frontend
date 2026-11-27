/** 편집 중인 유형별 초안을 API 저장 입력으로 변환하고 공통 검증 규칙을 적용합니다. */
import { z } from 'zod';
import type { CoordinatesViewModel } from './location/location-view-model';

const minuteTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, '시간을 HH:mm 형식으로 입력하세요.');
const apiTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?$/, '시간을 HH:mm 형식으로 입력하세요.');

const inputFields = {
  name: z.string().trim().min(1, '세션명을 입력하세요.'),
  startDate: z.iso.date('올바른 날짜를 입력하세요.'),
  endDate: z.iso.date('올바른 날짜를 입력하세요.'),
  startTime: apiTimeSchema,
  endTime: apiTimeSchema,
};

const regularSessionLocationSchema = z.object({
  roadAddress: z
    .string()
    .trim()
    .min(1, '주소를 선택하고 좌표 조회를 완료해 주세요.')
    .max(255, '도로명주소는 255자 이하여야 합니다.'),
  detailAddress: z.string().trim().max(255, '상세주소는 255자 이하여야 합니다.'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const regularSessionInputSchema = z.object({
  ...inputFields,
  type: z.literal('regular'),
  location: regularSessionLocationSchema,
});

const teamSessionInputSchema = z.object({
  ...inputFields,
  type: z.literal('team'),
});

type SessionScheduleInput = Pick<
  z.infer<typeof regularSessionInputSchema>,
  'startDate' | 'endDate' | 'startTime' | 'endTime'
>;

function isSessionScheduleValid({
  startDate,
  endDate,
  startTime,
  endTime,
}: SessionScheduleInput) {
  return endDate > startDate || (endDate === startDate && endTime > startTime);
}

/** API 연결용 폼 입력은 정규의 장소 필수와 팀의 장소 미입력을 구분한다. */
export const sessionInputSchema = z
  .discriminatedUnion('type', [regularSessionInputSchema, teamSessionInputSchema])
  .refine(isSessionScheduleValid, {
    message: '종료 일시는 시작 일시보다 늦어야 합니다.',
    path: ['endDate'],
  });

export type SessionInput = z.infer<typeof sessionInputSchema>;

const sessionFormValueSchema = z.object({
  name: z.string().trim().min(1, '세션명을 입력하세요.'),
  startDate: z.iso.date('올바른 날짜를 입력하세요.'),
  endDate: z.iso.date('올바른 날짜를 입력하세요.'),
  startTime: minuteTimeSchema,
  endTime: minuteTimeSchema,
  type: z.enum(['regular', 'team']),
  location: z.object({
    roadAddress: z.string(),
    detailAddress: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

export type SessionFormValues = z.input<typeof sessionFormValueSchema>;

export function sessionFormDefaults(initial?: SessionInput): SessionFormValues {
  return {
    name: initial?.name ?? '',
    startDate: initial?.startDate ?? '',
    endDate: initial?.endDate ?? '',
    startTime: initial?.startTime.slice(0, 5) ?? '',
    endTime: initial?.endTime.slice(0, 5) ?? '',
    type: initial?.type ?? 'regular',
    location:
      initial?.type === 'regular'
        ? initial.location
        : { roadAddress: '', detailAddress: '', latitude: undefined, longitude: undefined },
  };
}

function toSubmittedTime(value: string, initial: string | undefined) {
  if (!minuteTimeSchema.safeParse(value).success) {
    return value;
  }
  return initial?.slice(0, 5) === value ? initial : `${value}:00`;
}

/** 폼 값 전체를 검증하고 제출할 세션 입력으로 변환하는 Standard Schema를 만듭니다. */
export function createSessionFormSchema(initial?: SessionInput) {
  return sessionFormValueSchema
    .superRefine((value, context) => {
      const startTime = toSubmittedTime(value.startTime, initial?.startTime);
      const endTime = toSubmittedTime(value.endTime, initial?.endTime);
      const validDates =
        z.iso.date().safeParse(value.startDate).success &&
        z.iso.date().safeParse(value.endDate).success;
      if (validDates) {
        if (value.endDate < value.startDate) {
          context.addIssue({
            code: 'custom',
            message: '종료일은 시작일보다 빠를 수 없습니다.',
            path: ['endDate'],
          });
        } else if (!isSessionScheduleValid({ ...value, startTime, endTime })) {
          context.addIssue({
            code: 'custom',
            message: '종료 시간은 시작 시간보다 늦어야 합니다.',
            path: ['endTime'],
          });
        }
      }

      if (value.type !== 'regular') {
        return;
      }

      const location = regularSessionLocationSchema.safeParse(value.location);
      if (location.success) {
        return;
      }

      const issues = new Map<string, { message: string; path: PropertyKey[] }>();
      for (const issue of location.error.issues) {
        const field = issue.path[0];
        const path = ['location', field === 'detailAddress' ? 'detailAddress' : 'roadAddress'];
        const message =
          field === 'latitude' || field === 'longitude'
            ? '주소를 선택하고 좌표 조회를 완료해 주세요.'
            : issue.message;
        issues.set(`${path.join('.')}:${message}`, { message, path });
      }
      for (const issue of issues.values()) {
        context.addIssue({ code: 'custom', ...issue });
      }
    })
    .transform((value): SessionInput => {
      const common = {
        name: value.name,
        startDate: value.startDate,
        endDate: value.endDate,
        startTime: toSubmittedTime(value.startTime, initial?.startTime),
        endTime: toSubmittedTime(value.endTime, initial?.endTime),
      };
      if (value.type === 'team') {
        return { ...common, type: 'team' };
      }
      return {
        ...common,
        type: 'regular',
        location: regularSessionLocationSchema.parse(value.location),
      };
    });
}

/** 폼 스키마를 제출 경계에서도 다시 적용해 변환된 세션 입력을 반환합니다. */
export function parseSessionForm(value: SessionFormValues, initial?: SessionInput) {
  return createSessionFormSchema(initial).safeParse(value);
}

/** 좌표 폼 값을 지도 화면 모델로 변환합니다. */
export function toCoordinatesViewModel(
  location: SessionFormValues['location'],
): CoordinatesViewModel | undefined {
  if (location.latitude === undefined || location.longitude === undefined) {
    return undefined;
  }
  return {
    latitude: location.latitude,
    longitude: location.longitude,
  };
}
