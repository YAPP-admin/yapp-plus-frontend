/** 생성 API 계약과 세션 화면 모델 사이의 변환을 제공한다. */
import type { CreateSessionRequest } from '@yapp-plus/api/generated';
import { zAdminSessionResponse } from '@yapp-plus/api/generated';
import { z } from 'zod';
import { sessionInputSchema, type SessionInput } from './session-form';

const regularSessionResponseSchema = zAdminSessionResponse.extend({
  type: z.literal('REGULAR'),
  location: z.string(),
  roadAddress: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});
const teamSessionResponseSchema = zAdminSessionResponse.extend({
  type: z.literal('TEAM'),
  location: z.null(),
  roadAddress: z.null(),
  detailAddress: z.null(),
  latitude: z.null(),
  longitude: z.null(),
});

const sessionResponseSchema = z.preprocess(
  (input) => {
    // 관리자 API 계약이 배포되는 동안 기존 date 응답도 동일 날짜의 기간으로 복원한다.
    if (typeof input !== 'object' || input === null) {
      return input;
    }
    const parsed = z.record(z.string(), z.unknown()).safeParse(input);
    if (!parsed.success) {
      return input;
    }
    const value = parsed.data;
    if (typeof value.startDate === 'string' && typeof value.endDate === 'string') {
      return value;
    }
    if (typeof value.date === 'string') {
      return { ...value, startDate: value.date, endDate: value.date };
    }
    return value;
  },
  z.discriminatedUnion('type', [regularSessionResponseSchema, teamSessionResponseSchema]),
);

type SessionAttendanceViewModel = {
  started: boolean;
  total: number;
  present: number;
  absent: number;
  pending: number;
  late: number;
  reported: number;
};

type SessionViewModelBase = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  attendance: SessionAttendanceViewModel;
};

/** 유형에 따라 장소 존재 여부가 결정되는 세션 화면 모델이다. */
export type SessionViewModel =
  | (SessionViewModelBase & {
      type: 'regular';
      location: {
        roadAddress: string;
        detailAddress: string | null;
        latitude: number;
        longitude: number;
      };
    })
  | (SessionViewModelBase & { type: 'team'; location: null });

/** API 응답을 검증해 화면이 사용하는 세션 ViewModel로 변환한다. */
export function toSessionViewModel(response: unknown): SessionViewModel {
  const data = sessionResponseSchema.parse(response);

  const base = {
    id: Number(data.sessionId),
    name: data.name,
    startDate: data.startDate,
    endDate: data.endDate,
    startTime: data.startTime,
    endTime: data.endTime,
    attendance: {
      started: data.attendanceSummary.status === 'STARTED',
      total: data.attendanceSummary.totalCount,
      present: data.attendanceSummary.presentCount,
      absent: data.attendanceSummary.absentCount,
      pending: data.attendanceSummary.undecidedCount,
      late: data.attendanceSummary.lateCount,
      reported: data.attendanceSummary.reportCount,
    },
  };
  return data.type === 'REGULAR'
    ? {
        ...base,
        type: 'regular',
        location: {
          roadAddress: data.roadAddress,
          detailAddress: data.detailAddress,
          latitude: data.latitude,
          longitude: data.longitude,
        },
      }
    : { ...base, type: 'team', location: null };
}

/** 조회 모델의 저장값을 초 단위 시간과 장소 좌표를 보존한 수정 폼 입력으로 변환한다. */
export function toSessionInput(session: SessionViewModel): SessionInput {
  const common = {
    name: session.name,
    startDate: session.startDate,
    endDate: session.endDate,
    startTime: session.startTime,
    endTime: session.endTime,
  };
  return session.type === 'regular'
    ? {
        ...common,
        type: 'regular',
        location: {
          ...session.location,
          detailAddress: session.location.detailAddress ?? '',
        },
      }
    : { ...common, type: 'team' };
}

/** 폼 입력을 생성·수정 API가 요구하는 전체 본문으로 변환한다. */
export function toCreateSessionRequest(input: SessionInput): CreateSessionRequest {
  const data = sessionInputSchema.parse(input);

  if (data.type === 'team') {
    return {
      name: data.name,
      location: null,
      startDate: data.startDate,
      endDate: data.endDate,
      startTime: data.startTime,
      endTime: data.endTime,
      type: 'TEAM',
      roadAddress: null,
      detailAddress: null,
      latitude: null,
      longitude: null,
    };
  }

  const detailAddress = data.location.detailAddress || null;

  return {
    name: data.name,
    location: [data.location.roadAddress, detailAddress].filter(Boolean).join(' '),
    startDate: data.startDate,
    endDate: data.endDate,
    startTime: data.startTime,
    endTime: data.endTime,
    type: 'REGULAR',
    roadAddress: data.location.roadAddress,
    detailAddress,
    latitude: data.location.latitude,
    longitude: data.location.longitude,
  };
}
