/** 공지 수신자 현황 API의 query key와 query 옵션을 제공한다. */
import { queryOptions } from '@tanstack/react-query';
import { recipientsQueryKey } from '@yapp-plus/api/generated';
import { listAdminPostRecipients, type ListAdminPostRecipientsInput } from './post-recipient-api';

export function adminPostRecipientsQueryKey(input: ListAdminPostRecipientsInput) {
  return recipientsQueryKey({
    path: { generationId: input.generationId, postId: input.postId },
    query: { cursor: input.cursor },
  });
}

export function adminPostRecipientsQueryOptions(input: ListAdminPostRecipientsInput) {
  return queryOptions({
    queryKey: adminPostRecipientsQueryKey(input),
    queryFn: () => listAdminPostRecipients(input),
    retry: false,
  });
}
