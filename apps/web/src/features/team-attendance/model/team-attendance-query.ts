/** 실제 팀원과 기존 접수 여부를 같은 인증 세션 범위에서 조회한다. */
import { queryOptions } from '@tanstack/react-query';
import {
  find1,
  find5,
  zUserTeamMembersResponse,
  zUserTeamPhotoResponse,
  type CreateClientConfig,
  type UserTeamMemberResponse,
} from '@yapp-plus/api/generated';
import { teamAttendanceTargetSchema } from './submission-input';

const positionLabels = {
  PM: 'PM',
  DESIGN: 'Design',
  ANDROID: 'Android',
  IOS: 'iOS',
  WEB: 'Web',
  MOBILE: 'Mobile',
  SERVER: 'Server',
  AI_NATIVE: 'AI Native',
} satisfies Record<NonNullable<UserTeamMemberResponse['position']>, string>;

async function fetchTarget(
  sessionId: number,
  apiOptions: ReturnType<CreateClientConfig>,
  signal: AbortSignal,
) {
  const { data } = await find5({
    ...apiOptions,
    path: { sessionId },
    signal,
    throwOnError: true,
  });
  signal.throwIfAborted();
  const roster = zUserTeamMembersResponse.parse(data);
  const [self, ...otherMatches] = roster.members.filter((member) => member.isMe);
  if (!self || otherMatches.length) {
    throw new Error('팀원 명단에서 본인을 확인하지 못했어요.');
  }

  return teamAttendanceTargetSchema.parse({
    sessionId,
    teamId: Number(roster.teamId),
    teamName: roster.teamName,
    selfMembershipId: Number(self.membershipId),
    members: roster.members.map(({ membershipId, name, position }) => ({
      membershipId: Number(membershipId),
      name,
      positionLabel: position === null ? '—' : positionLabels[position],
    })),
  });
}

async function fetchHasExistingPhoto(
  sessionId: number,
  apiOptions: ReturnType<CreateClientConfig>,
  signal: AbortSignal,
) {
  try {
    const { data } = await find1({
      ...apiOptions,
      path: { sessionId },
      signal,
      retry: 0,
      throwOnError: true,
    });
    signal.throwIfAborted();
    return zUserTeamPhotoResponse.parse(data).photo !== null;
  } catch {
    signal.throwIfAborted();
    return false;
  }
}

/** 인증 세션별로 검증한 현재 명단과 접수 여부만 제공한다. 서명 URL은 보관하지 않는다. */
export function teamAttendanceEntryQueryOptions({
  sessionId,
  authSessionId,
  apiOptions,
}: {
  sessionId: number;
  authSessionId: string;
  apiOptions: ReturnType<CreateClientConfig>;
}) {
  return queryOptions({
    queryKey: ['team-attendance-entry', authSessionId, sessionId] as const,
    gcTime: 0,
    staleTime: 0,
    retry: false,
    queryFn: async ({ signal }) => {
      if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
        throw new Error('팀 세션을 확인하지 못했어요.');
      }
      const target = await fetchTarget(sessionId, apiOptions, signal);
      const hasExistingPhoto = await fetchHasExistingPhoto(sessionId, apiOptions, signal);
      return { target, hasExistingPhoto };
    },
  });
}
