import { base, en, Faker } from '@faker-js/faker';
import { http, HttpResponse, type JsonBodyType, onUnhandledRequest } from 'msw';
import { z, type ZodType } from 'zod';
import type {
  AdminAttendanceListResponse,
  NotificationHistoryItemResponse,
} from '../generated/types.gen';

import * as generatedFaker from '../generated/@faker-js/faker.gen';
import { createMswHandlers } from '../generated/msw.gen';
import * as schemas from '../generated/zod.gen';
import * as fixtures from './fixtures';

const mockAttendanceSelectionSchema = z.object({
  status: z.enum(['undecided', 'present', 'late', 'earlyLeave', 'absent']),
  penaltyCategory: z.enum(['regular', 'unauthorized']).nullable(),
  durationBand: z.enum(['withinOneHour', 'withinThreeHours']).nullable(),
  reason: z.string().nullable().optional(),
});
const mockOverrideBodySchema = schemas.zOverrideBody.extend({
  mockSelections: z.array(mockAttendanceSelectionSchema).min(1).optional(),
});
type MockAttendanceSelection = z.infer<typeof mockAttendanceSelectionSchema>;
type MockAttendanceRow = AdminAttendanceListResponse['items'][number] & {
  mockSelections?: MockAttendanceSelection[];
};

function normalizeBaseUrl(value: string): string {
  if (!/^https?:\/\//.test(value)) {
    throw new Error('모킹 API 주소는 절대 HTTP(S) URL이어야 합니다.');
  }
  const url = new URL(value);
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('모킹 API 주소에는 인증 정보·query·hash를 포함할 수 없습니다.');
  }
  return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
}

function response(body: JsonBodyType, schema: ZodType, status: number) {
  // Zod의 int64 파싱 출력은 bigint이므로 검증 후 원래 JSON 값을 사용합니다.
  if (!schema.safeParse(body).success) {
    return new HttpResponse('모의 응답이 생성 계약과 일치하지 않습니다.', { status: 501 });
  }
  return body === undefined
    ? new HttpResponse(null, { status })
    : HttpResponse.json(body, { status });
}

function fakerResponse(
  factory: (options?: generatedFaker.Options) => JsonBodyType,
  schema: ZodType,
  status = 200,
) {
  return () => {
    // 요청 순서나 다른 테스트가 전역 Faker 상태를 바꾸지 못하도록 매번 독립 인스턴스를 사용합니다.
    const faker = new Faker({ locale: [en, base] });
    faker.seed(107);
    faker.setDefaultRefDate('2026-10-26T00:00:00Z');
    return response(factory({ faker }), schema, status);
  };
}

function fixedResponse(body: JsonBodyType, schema: ZodType) {
  return () => response(body, schema, 200);
}

function scoreDeltaForStatus(status: AdminAttendanceListResponse['items'][number]['status']) {
  switch (status) {
    case 'PRESENT':
    case 'UNDECIDED':
      return 0;
    case 'LATE_ONE_HOUR':
    case 'EARLY_LEAVE':
      return -4;
    case 'LATE_THREE_HOUR':
      return -8;
    case 'ABSENT':
      return -12;
    case 'EXCUSED_ABSENCE':
      return 0;
  }
  return 0;
}

function scoreDeltaForMockSelection(selection: MockAttendanceSelection) {
  switch (selection.status) {
    case 'late':
    case 'earlyLeave':
      if (selection.durationBand === 'withinThreeHours') {
        return selection.penaltyCategory === 'unauthorized' ? -14 : -8;
      }
      return selection.penaltyCategory === 'unauthorized' ? -10 : -4;
    case 'absent':
      return selection.penaltyCategory === 'unauthorized' ? -20 : -12;
    case 'present':
    case 'undecided':
      return 0;
  }
  return 0;
}

function scoreDeltaForSelections(selections: MockAttendanceSelection[]) {
  return selections.reduce((total, selection) => total + scoreDeltaForMockSelection(selection), 0);
}

export function createApiMockHandlers(
  baseUrl: string,
  options: { scenario?: 'default' | 'empty' | 'cancel-not-found' } = {},
) {
  const empty = options.scenario === 'empty';
  const cancelNotFound = options.scenario === 'cancel-not-found';
  const factory = createMswHandlers({
    baseUrl: normalizeBaseUrl(baseUrl),
    responseFallback: 'error',
  });
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const notificationHistory: NotificationHistoryItemResponse[] = empty
    ? []
    : [...fixtures.adminNotifications.items];
  let nextNotificationId =
    notificationHistory.reduce((maxId, notification) => Math.max(maxId, notification.id), 0) + 1;
  const attendanceBySession = new Map<string, AdminAttendanceListResponse>();

  function getNotificationPage(cursor: string | null) {
    const pageSize = 4;
    const pageIndex = cursor === null ? 0 : Number(cursor.replace('mock-page-', '')) - 1;
    const start = Number.isInteger(pageIndex) && pageIndex >= 0 ? pageIndex * pageSize : 0;
    const items = notificationHistory.slice(start, start + pageSize);
    const nextCursor =
      start + items.length < notificationHistory.length ? `mock-page-${pageIndex + 2}` : null;
    return { items, nextCursor };
  }

  function getAttendance(sessionKey: string) {
    const existing = attendanceBySession.get(sessionKey);
    if (existing !== undefined) {
      return existing;
    }

    const attendance = empty
      ? { items: [], nextCursor: null }
      : generatedFaker.fakeList7Response200({
          faker: (() => {
            const faker = new Faker({ locale: [en, base] });
            faker.seed(107);
            faker.setDefaultRefDate('2026-10-26T00:00:00Z');
            return faker;
          })(),
        });
    attendanceBySession.set(sessionKey, attendance);
    return attendance;
  }

  // 명시한 Faker·대표 응답이 우선하며, 미연결 API는 생성 핸들러의 명세 예제 또는 501을 사용합니다.
  return [
    http.get(`${normalizedBaseUrl}/api/admin/notifications`, ({ request }) =>
      response(
        getNotificationPage(new URL(request.url).searchParams.get('cursor')),
        schemas.zHistoryResponse,
        200,
      ),
    ),
    http.post(`${normalizedBaseUrl}/api/admin/notifications`, async ({ request }) => {
      const parsedBody = schemas.zCreate1Body.safeParse(await request.json());
      if (!parsedBody.success) {
        return new HttpResponse('잘못된 알림 요청입니다.', { status: 400 });
      }

      const body = parsedBody.data;
      const id = nextNotificationId;
      nextNotificationId += 1;
      const scheduledAt = body.scheduledAt ?? null;
      notificationHistory.unshift({
        id,
        content: body.content,
        targetRole: body.targetRole,
        position: body.position,
        status: scheduledAt === null ? 'IN_PROGRESS' : 'SCHEDULED',
        referenceAt: scheduledAt ?? new Date().toISOString(),
      });

      return response(
        { id, status: scheduledAt === null ? 'QUEUED' : 'SCHEDULED', scheduledAt },
        schemas.zCreate1Response,
        202,
      );
    }),
    http.post(
      `${normalizedBaseUrl}/api/admin/notifications/:notificationId/cancel`,
      ({ params }) => {
        if (cancelNotFound) {
          return HttpResponse.json(
            { code: 'NOTIFICATION_NOT_FOUND', message: 'private' },
            { status: 404 },
          );
        }

        const notificationId = Number(params.notificationId);
        const notification = notificationHistory.find((item) => item.id === notificationId);
        if (notification !== undefined) {
          notification.status = 'CANCELED';
        }
        return new HttpResponse(null, { status: 204 });
      },
    ),
    http.get(`${normalizedBaseUrl}/api/admin/generations/:generationId/members`, ({ request }) => {
      const params = new URL(request.url).searchParams;
      const name = params.get('name');
      const position = params.get('position');
      const teamId = params.get('teamId');
      const items = fixtures.adminMembers.items.filter((member) => {
        const requestedTeamName =
          teamId === null
            ? null
            : fixtures.adminMemberTeams.find((team) => String(team.teamId) === teamId)?.name;
        return (
          (name === null || member.name === name) &&
          (position === null || member.position === position) &&
          (teamId === null || member.teamName === requestedTeamName)
        );
      });
      return response({ items, nextCursor: null }, schemas.zAdminMemberListResponse, 200);
    }),
    http.get(`${normalizedBaseUrl}/api/admin/generations/:generationId/member-team-options`, () =>
      response(fixtures.adminMemberTeams, schemas.zTeamOptionsResponse, 200),
    ),
    http.get(`${normalizedBaseUrl}/api/admin/generations/:generationId/posts`, ({ request }) => {
      const type = new URL(request.url).searchParams.get('type');
      const items = type
        ? fixtures.adminPosts.items.filter((post) => post.type === type)
        : fixtures.adminPosts.items;
      return response(
        { totalPostCount: items.length, items, nextCursor: null },
        schemas.zAdminPostListResponse,
        200,
      );
    }),
    http.get(
      `${normalizedBaseUrl}/api/admin/generations/:generationId/posts/:postId`,
      ({ params }) => {
        const postId = Number(params.postId);
        // 기존 API 계약 테스트가 사용하는 대표 ID 1은 첫 공지 상세로 호환합니다.
        const post =
          fixtures.adminPostDetails[postId] ??
          (postId === 1 ? fixtures.adminPostDetails[101] : undefined);
        if (!post) {
          return HttpResponse.json(
            { code: 'POST_NOT_FOUND', message: '공지 정보를 찾을 수 없습니다.' },
            { status: 404 },
          );
        }
        return response(post, schemas.zAdminPostDetailResponse, 200);
      },
    ),
    http.get(`${normalizedBaseUrl}/api/admin/generations/:generationId/members/:memberId`, () =>
      response(fixtures.adminMemberDetail, schemas.zDetail1Response, 200),
    ),
    http.put(`${normalizedBaseUrl}/api/admin/generations/:generationId/members/:memberId`, () =>
      response(fixtures.adminMemberDetail, schemas.zCorrectResponse, 200),
    ),
    http.get(`${normalizedBaseUrl}/api/admin/generations/:generationId/teams`, () =>
      response(fixtures.adminTeams, schemas.zFindAllResponse, 200),
    ),
    http.get(
      `${normalizedBaseUrl}/api/admin/generations/:generationId/team-member-candidates`,
      ({ request }) => {
        const assigned = new URL(request.url).searchParams.get('assigned');
        const candidates =
          assigned === null
            ? fixtures.adminTeamMemberCandidates
            : fixtures.adminTeamMemberCandidates.filter(
                (candidate) => candidate.assigned === (assigned === 'true'),
              );
        return response(candidates, schemas.zCandidatesResponse, 200);
      },
    ),
    http.get(
      `${normalizedBaseUrl}/api/admin/generations/:generationId/teams/:teamId`,
      ({ params }) => {
        const team = fixtures.adminTeams.find(
          (candidate) => String(candidate.teamId) === params.teamId,
        );
        return team === undefined
          ? HttpResponse.json(
              { code: 'TEAM_NOT_FOUND', message: '팀을 찾을 수 없습니다.' },
              { status: 404 },
            )
          : response(team, schemas.zFindResponse, 200);
      },
    ),
    http.get(
      `${normalizedBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId/attendance`,
      ({ params }) => {
        const sessionKey = `${String(params.generationId)}:${String(params.sessionId)}`;
        return response(getAttendance(sessionKey), schemas.zList7Response, 200);
      },
    ),
    http.patch(
      `${normalizedBaseUrl}/api/admin/generations/:generationId/sessions/:sessionId/attendance/:membershipId`,
      async ({ params, request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return HttpResponse.json({ code: 'INVALID_ATTENDANCE_REQUEST' }, { status: 400 });
        }

        const parsedBody = mockOverrideBodySchema.safeParse(body);
        if (!parsedBody.success) {
          return HttpResponse.json({ code: 'INVALID_ATTENDANCE_REQUEST' }, { status: 400 });
        }

        const sessionKey = `${String(params.generationId)}:${String(params.sessionId)}`;
        const attendance = getAttendance(sessionKey);
        const member = attendance.items.find(
          (item) => String(item.membershipId) === params.membershipId,
        );
        if (member === undefined) {
          return HttpResponse.json({ code: 'MEMBERSHIP_NOT_FOUND' }, { status: 404 });
        }

        member.status = parsedBody.data.status;
        const mockMember = member as MockAttendanceRow;
        const selections = parsedBody.data.mockSelections;
        if (selections === undefined) {
          member.scoreDelta = scoreDeltaForStatus(parsedBody.data.status);
        } else {
          mockMember.mockSelections = selections;
          member.scoreDelta = scoreDeltaForSelections(selections);
        }
        member.checkedInAt = parsedBody.data.checkedInAt ?? member.checkedInAt;
        member.earlyLeaveAt = parsedBody.data.earlyLeaveAt ?? member.earlyLeaveAt;
        return HttpResponse.json({}, { status: 200 });
      },
    ),
    ...factory.all({
      pick: {
        find: fakerResponse(generatedFaker.fakeFindResponse200, schemas.zFindResponse),
        update: fakerResponse(generatedFaker.fakeUpdateResponse200, schemas.zUpdateResponse),
        delete: () => new HttpResponse(null, { status: 204 }),
        replaceMembers: fakerResponse(
          generatedFaker.fakeReplaceMembersResponse200,
          schemas.zReplaceMembersResponse,
        ),
        register1: fakerResponse(
          generatedFaker.fakeRegister1Response200,
          schemas.zRegister1Response,
        ),
        renew: fakerResponse(generatedFaker.fakeRenewResponse200, schemas.zRenewResponse),
        consumeHandoff: fakerResponse(
          generatedFaker.fakeConsumeHandoffResponse200,
          schemas.zConsumeHandoffResponse,
        ),
        authenticateKakao: fakerResponse(
          generatedFaker.fakeAuthenticateKakaoResponse200,
          schemas.zAuthenticateKakaoResponse,
        ),
        authenticateGoogle: fakerResponse(
          generatedFaker.fakeAuthenticateGoogleResponse200,
          schemas.zAuthenticateGoogleResponse,
        ),
        authenticateApple: fakerResponse(
          generatedFaker.fakeAuthenticateAppleResponse200,
          schemas.zAuthenticateAppleResponse,
        ),
        verify: fakerResponse(generatedFaker.fakeVerifyResponse200, schemas.zVerifyResponse),
        submit1: fakerResponse(generatedFaker.fakeSubmit1Response200, schemas.zSubmit1Response),
        reject: fakerResponse(generatedFaker.fakeRejectResponse200, schemas.zRejectResponse),
        approve: fakerResponse(generatedFaker.fakeApproveResponse200, schemas.zApproveResponse),
        findAll: fakerResponse(generatedFaker.fakeFindAllResponse200, schemas.zFindAllResponse),
        create2: fakerResponse(
          generatedFaker.fakeCreate2Response201,
          schemas.zCreate2Response,
          201,
        ),
        find2: fixedResponse(
          empty ? fixtures.emptySessions : fixtures.sessions,
          schemas.zSessionListResponse,
        ),
        create3: fakerResponse(
          generatedFaker.fakeCreate3Response201,
          schemas.zCreate3Response,
          201,
        ),
        get: fakerResponse(generatedFaker.fakeGetResponse200, schemas.zGetResponse),
        start: fakerResponse(generatedFaker.fakeStartResponse200, schemas.zStartResponse),
        reissue: fakerResponse(generatedFaker.fakeReissueResponse200, schemas.zReissueResponse),
        list1: fakerResponse(generatedFaker.fakeList1Response200, schemas.zList1Response),
        create4: fakerResponse(
          generatedFaker.fakeCreate4Response201,
          schemas.zCreate4Response,
          201,
        ),
        presign2: fakerResponse(generatedFaker.fakePresign2Response200, schemas.zPresign2Response),
        login: fixedResponse(fixtures.staffLogin, schemas.zStaffLoginResponse),
        detail1: fixedResponse(fixtures.adminMemberDetail, schemas.zDetail1Response),
        detail2: fixedResponse(fixtures.adminPostDetails[101], schemas.zDetail2Response),
        update2: () => new HttpResponse(null, { status: 204 }),
        update3: fakerResponse(generatedFaker.fakeUpdate3Response200, schemas.zUpdate3Response),
        find6: fixedResponse(
          empty ? fixtures.emptyWeek : fixtures.currentWeek,
          schemas.zFind6Response,
        ),
        find7: fakerResponse(generatedFaker.fakeFind7Response200, schemas.zFind7Response),
        findPending: fakerResponse(
          generatedFaker.fakeFindPendingResponse200,
          schemas.zFindPendingResponse,
        ),
        findDetail: fakerResponse(
          generatedFaker.fakeFindDetailResponse200,
          schemas.zFindDetailResponse,
        ),
        findCandidates: fakerResponse(
          generatedFaker.fakeFindCandidatesResponse200,
          schemas.zFindCandidatesResponse,
        ),
        list5: fixedResponse(fixtures.adminGenerations, schemas.zAdminGenerationListResponse),
        candidates: fakerResponse(
          generatedFaker.fakeCandidatesResponse200,
          schemas.zCandidatesResponse,
        ),
        list7: fakerResponse(generatedFaker.fakeList7Response200, schemas.zList7Response),
        recipients1: fixedResponse(
          empty ? fixtures.emptyRecipients : fixtures.postRecipients,
          schemas.zRecipients1Response,
        ),
        revoke: () => new HttpResponse(null, { status: 204 }),
        delete1: () => new HttpResponse(null, { status: 204 }),
        logout: () => new HttpResponse(null, { status: 204 }),
      },
    }),
  ];
}

export function onUnhandledApiRequest(baseUrl: string) {
  const baseUrlObject = new URL(normalizeBaseUrl(baseUrl));
  const apiPath = `${baseUrlObject.pathname.replace(/\/+$/, '')}/api`;
  return async (request: Request) => {
    const url = new URL(request.url);
    if (
      url.origin === baseUrlObject.origin &&
      (url.pathname === apiPath || url.pathname.startsWith(`${apiPath}/`))
    ) {
      // MSW 2.15의 콜백 print.error는 출력만 하므로 실제 차단하는 공개 함수를 기다립니다.
      await onUnhandledRequest(request, 'error');
    }
  };
}
