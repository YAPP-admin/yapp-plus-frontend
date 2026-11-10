import { QueryClient } from '@tanstack/react-query';
import { zUserProfileResponse } from '@yapp-plus/api/generated';
import { expect, it } from 'vitest';
import { apiBaseUrl, server } from '../../../mocks/server';
import { HttpResponse, http } from 'msw';
import { profileQueryOptions } from './profile-query';

const profileUrl = `${apiBaseUrl}/api/users/me`;

it('생성 key와 요청을 유지하면서 int64를 검증하고 원본 number를 반환한다', async () => {
  const body = {
    userId: 1,
    name: '테스트 회원',
    membershipStatus: 'PLAYER',
    generationId: 28,
    generationNumber: 28,
    position: 'WEB',
  };
  server.use(http.get(profileUrl, () => HttpResponse.json(body)));
  const options = profileQueryOptions({ baseUrl: apiBaseUrl, retry: 0 });
  const data = await new QueryClient().fetchQuery(options);
  expect(data).toEqual(body);
  expect(typeof data?.userId).toBe('number');
  expect(zUserProfileResponse.parse(body).userId).toBe(1n);
});

it('안전하게 표현할 수 없는 int64는 조회 성공 데이터가 되지 않는다', async () => {
  server.use(
    http.get(profileUrl, () =>
      HttpResponse.json({
        userId: '9007199254740992',
        name: '테스트 회원',
        membershipStatus: 'PLAYER',
        generationId: null,
        generationNumber: 28,
        position: 'WEB',
      }),
    ),
  );
  const options = profileQueryOptions({ baseUrl: apiBaseUrl, retry: 0 });
  const client = new QueryClient();
  await expect(client.fetchQuery(options)).rejects.toThrow(
    '정밀도를 보장할 수 없는 회원 ID입니다.',
  );
  expect(client.getQueryData(options.queryKey)).toBeUndefined();
});
