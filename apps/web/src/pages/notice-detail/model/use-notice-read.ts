/** 공지 읽음 저장의 mutation과 상세 cache 갱신을 화면에서 분리한다. */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { acknowledgeMutation } from '@yapp-plus/api/generated';
import type { MemberNoticeDetail } from './notice-detail-query';

/** 읽음 저장 성공을 현재 상세 cache에 반영하고 서버 상세를 다시 조회한다. */
export function useNoticeRead({
  apiOptions,
  queryKey,
}: {
  apiOptions: Parameters<typeof acknowledgeMutation>[0];
  queryKey: readonly unknown[];
}) {
  const queryClient = useQueryClient();

  return useMutation({
    ...acknowledgeMutation(apiOptions),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MemberNoticeDetail>(queryKey);
      queryClient.setQueryData(queryKey, (cached: MemberNoticeDetail | undefined) =>
        cached ? { ...cached, read: true } : cached,
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey, refetchType: 'active' });
    },
  });
}
