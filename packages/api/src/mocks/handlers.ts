import { base, en, Faker } from '@faker-js/faker';
import { HttpResponse, type JsonBodyType, onUnhandledRequest } from 'msw';
import type { ZodType } from 'zod';

import * as generatedFaker from '../generated/@faker-js/faker.gen';
import { createMswHandlers } from '../generated/msw.gen';
import * as schemas from '../generated/zod.gen';
import * as fixtures from './fixtures';

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

export function createApiMockHandlers(
  baseUrl: string,
  options: { scenario?: 'default' | 'empty' } = {},
) {
  const empty = options.scenario === 'empty';
  const factory = createMswHandlers({
    baseUrl: normalizeBaseUrl(baseUrl),
    responseFallback: 'error',
  });
  // 명시한 Faker·대표 응답이 우선하며, 미연결 API는 생성 핸들러의 명세 예제 또는 501을 사용합니다.
  return [
    ...factory.all({
      pick: {
        find: fakerResponse(generatedFaker.fakeFindResponse200, schemas.zFindResponse),
        update: fakerResponse(generatedFaker.fakeUpdateResponse200, schemas.zUpdateResponse),
        delete: () => new HttpResponse(null, { status: 204 }),
        replaceMembers: fakerResponse(
          generatedFaker.fakeReplaceMembersResponse200,
          schemas.zReplaceMembersResponse,
        ),
        register: fakerResponse(generatedFaker.fakeRegisterResponse200, schemas.zRegisterResponse),
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
        create: fakerResponse(generatedFaker.fakeCreateResponse201, schemas.zCreateResponse, 201),
        find1: fixedResponse(
          empty ? fixtures.emptySessions : fixtures.sessions,
          schemas.zSessionListResponse,
        ),
        create1: fakerResponse(
          generatedFaker.fakeCreate1Response201,
          schemas.zCreate1Response,
          201,
        ),
        get: fakerResponse(generatedFaker.fakeGetResponse200, schemas.zGetResponse),
        start: fakerResponse(generatedFaker.fakeStartResponse200, schemas.zStartResponse),
        reissue: fakerResponse(generatedFaker.fakeReissueResponse200, schemas.zReissueResponse),
        list: fakerResponse(generatedFaker.fakeListResponse200, schemas.zListResponse),
        create2: fakerResponse(
          generatedFaker.fakeCreate2Response201,
          schemas.zCreate2Response,
          201,
        ),
        presign1: fakerResponse(generatedFaker.fakePresign1Response200, schemas.zPresign1Response),
        login: fixedResponse(fixtures.staffLogin, schemas.zStaffLoginResponse),
        detail: fakerResponse(generatedFaker.fakeDetailResponse200, schemas.zDetailResponse),
        update1: fakerResponse(generatedFaker.fakeUpdate1Response200, schemas.zUpdate1Response),
        find2: fixedResponse(
          empty ? fixtures.emptyWeek : fixtures.currentWeek,
          schemas.zCurrentWeekSessionResponse,
        ),
        find3: fakerResponse(generatedFaker.fakeFind3Response200, schemas.zFind3Response),
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
        candidates: fakerResponse(
          generatedFaker.fakeCandidatesResponse200,
          schemas.zCandidatesResponse,
        ),
        list3: fakerResponse(generatedFaker.fakeList3Response200, schemas.zList3Response),
        recipients: fixedResponse(
          empty ? fixtures.emptyRecipients : fixtures.postRecipients,
          schemas.zAdminPostRecipientListResponse,
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
