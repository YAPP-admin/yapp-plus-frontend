import { markStaticNoticeRead, staticContentEnabled } from '@/features/static-content';
/** 공지 읽음 저장의 mutation과 상세 cache 갱신을 화면에서 분리한다. */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { acknowledgeMutation } from '@yapp-plus/api/generated';
import type { AuthResult, AuthSession } from '@yapp-plus/app-bridge';
import { nativeSessionQueryKey } from '@/features/auth';
import { memberNoticeDetailQueryOptions, type MemberNoticeDetail } from './notice-detail-query';

type NoticeReadOwner = Pick<AuthSession, 'userId' | 'sessionId'>;

type NoticeReadOptions = {
  apiOptions: Parameters<typeof acknowledgeMutation>[0];
  postId: number;
  owner?: NoticeReadOwner;
};

const ownsNotice = (queryClient: ReturnType<typeof useQueryClient>, owner?: NoticeReadOwner) => {
  if (!owner) {
    return true;
  }

  const session = queryClient.getQueryData<AuthResult>(nativeSessionQueryKey);
  return (
    session?.status === 'SIGNED_IN' &&
    session.session.userId === owner.userId &&
    session.session.sessionId === owner.sessionId
  );
};

/** 현재 상세의 읽음 저장 mutation을 제공하고 계정 전환 뒤의 늦은 결과를 격리합니다. */
export function useNoticeRead({ apiOptions, postId, owner }: NoticeReadOptions) {
  const queryClient = useQueryClient();
  const queryKey = memberNoticeDetailQueryOptions(postId, apiOptions).queryKey;

  const generated = acknowledgeMutation(apiOptions);
  return useMutation({
    ...generated,
    mutationFn: staticContentEnabled()
      ? () =>
          markStaticNoticeRead(
            postId,
            typeof apiOptions?.auth === 'string' ? apiOptions.auth : undefined,
          )
      : generated.mutationFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MemberNoticeDetail>(queryKey);
      const canUpdate = ownsNotice(queryClient, owner);
      if (!canUpdate) {
        return { canUpdate, previous };
      }

      queryClient.setQueryData(queryKey, (cached: MemberNoticeDetail | undefined) =>
        cached ? { ...cached, read: true } : cached,
      );
      return { canUpdate, previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.canUpdate && ownsNotice(queryClient, owner) && context.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSuccess: () => {
      if (ownsNotice(queryClient, owner)) {
        void queryClient.invalidateQueries({ queryKey, refetchType: 'active' });
      }
    },
  });
}
