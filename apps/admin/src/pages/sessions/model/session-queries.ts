/** 세션 Mutation 성공 뒤 목록의 이전 응답을 취소하고 재조회를 예약합니다. */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { create2Mutation, find1Options } from '@yapp-plus/api/generated';

export const createSessionMutationOptions = create2Mutation();

export function useCreateSessionMutation(generationId: number) {
  const queryClient = useQueryClient();
  const listOptions = find1Options({
    path: { generationId },
    query: { type: 'ALL' },
  });

  return useMutation({
    ...createSessionMutationOptions,
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: listOptions.queryKey });
      void queryClient.invalidateQueries({ queryKey: listOptions.queryKey });
    },
  });
}
