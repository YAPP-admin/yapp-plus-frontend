/** 생성 SDK Mutation 옵션을 사용하고 변경 뒤 전체 목록 재조회를 예약합니다. */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  create2Mutation,
  delete1Mutation,
  find1Options,
  update1Mutation,
} from '@yapp-plus/api/generated';

export const createSessionMutationOptions = create2Mutation();
export const updateSessionMutationOptions = update1Mutation();
export const deleteSessionMutationOptions = delete1Mutation();

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

export function useUpdateSessionMutation(generationId: number) {
  const queryClient = useQueryClient();
  const listOptions = find1Options({
    path: { generationId },
    query: { type: 'ALL' },
  });

  return useMutation({
    ...updateSessionMutationOptions,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listOptions.queryKey });
    },
  });
}

export function useDeleteSessionMutation(generationId: number) {
  const queryClient = useQueryClient();
  const listOptions = find1Options({
    path: { generationId },
    query: { type: 'ALL' },
  });

  return useMutation({
    ...deleteSessionMutationOptions,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: listOptions.queryKey });
    },
  });
}
