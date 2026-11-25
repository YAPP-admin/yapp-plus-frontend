import {
  cancelMutation,
  createMutation,
  historyInfiniteOptions,
  historyInfiniteQueryKey,
} from '@yapp-plus/api/generated';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toNotificationApiFailure } from './notification-api';

export function notificationHistoryQueryOptions() {
  const options = historyInfiniteOptions();
  return {
    ...options,
    getNextPageParam: (lastPage: { nextCursor: string | null }) => lastPage.nextCursor ?? undefined,
  };
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const invalidateHistory = () =>
    queryClient.invalidateQueries({ queryKey: historyInfiniteQueryKey() });

  const create = useMutation({
    ...createMutation(),
    onSuccess: async () => {
      await invalidateHistory();
    },
    onError: async (error) => {
      if (toNotificationApiFailure(error).status === 409) {
        await invalidateHistory();
      }
    },
  });

  const cancel = useMutation({
    ...cancelMutation(),
    onSuccess: async () => {
      await invalidateHistory();
    },
    onError: async (error) => {
      if (toNotificationApiFailure(error).status === 409) {
        await invalidateHistory();
      }
    },
  });

  return { create, cancel };
}
