import type {
  GenerationRosterListResponse,
  GenerationRosterRegistrationResult,
  RegisterGenerationRosterRequest,
} from '@yapp-plus/api/generated';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiBaseUrl, server } from '../../../../mocks/server';
import { getRosterEntries, registerRoster } from './roster-api';

const rosterRequest = {
  generationId: 33,
  entries: [
    {
      clientRowId: 'row-1',
      generationId: 33,
      name: '김지원',
      phoneNumber: '010-8765-4321',
      position: 'WEB',
      role: 'PLAYER',
    },
  ],
} satisfies RegisterGenerationRosterRequest;

const rosterRegistrationResponse = {
  registrationId: 401,
  generationId: 33,
  rows: [{ clientRowId: 'row-1', rosterEntryId: 501, action: 'CREATED' }],
  createdCount: 1,
  updatedCount: 0,
  unchangedCount: 0,
} satisfies GenerationRosterRegistrationResult;

describe('Roster API adapter', () => {
  it('사전 명단을 커서 조회한다', async () => {
    const response = {
      items: [
        {
          rosterEntryId: 501,
          name: '김지원',
          phoneNumber: '+821087654321',
          generationId: 33,
          position: 'WEB',
          role: 'PLAYER',
          status: 'AVAILABLE',
        },
      ],
      nextCursor: null,
    } satisfies GenerationRosterListResponse;
    let requestUrl: URL | undefined;
    server.use(
      http.get(
        `${apiBaseUrl}/api/admin/generations/:generationId/roster-entries`,
        ({ request }) => {
          requestUrl = new URL(request.url);
          return HttpResponse.json(response);
        },
      ),
    );

    await expect(getRosterEntries(33, { cursor: 'roster-cursor' })).resolves.toEqual(response);
    expect(requestUrl?.pathname).toBe('/api/admin/generations/33/roster-entries');
    expect(requestUrl?.searchParams.get('cursor')).toBe('roster-cursor');
  });

  it('명시한 generationId로 사전 명단을 등록한다', async () => {
    let requestBody: unknown;
    server.use(
      http.post(
        `${apiBaseUrl}/api/admin/generations/33/roster-registrations`,
        async ({ request }) => {
          requestBody = await request.json();
          return HttpResponse.json(rosterRegistrationResponse, { status: 201 });
        },
      ),
    );

    await expect(registerRoster(33, rosterRequest)).resolves.toEqual(rosterRegistrationResponse);
    expect(requestBody).toEqual(rosterRequest);
  });
});
