/** 생성 Admin Post SDK와 공지 수신자 현황 조회 사이의 요청 경계를 감싼다. */
import {
  recipients,
  type AdminPostRecipientListResponse,
  type Options,
  type RecipientsData,
} from '@yapp-plus/api/generated';

export type ListAdminPostRecipientsInput = Readonly<{
  generationId: RecipientsData['path']['generationId'];
  postId: RecipientsData['path']['postId'];
  cursor?: NonNullable<RecipientsData['query']>['cursor'];
}>;

/** 공지 수신자·읽음 현황을 cursor 기준으로 조회한다. */
export async function listAdminPostRecipients(
  input: ListAdminPostRecipientsInput,
): Promise<AdminPostRecipientListResponse> {
  const query = input.cursor === undefined ? undefined : { cursor: input.cursor };
  const { data } = await recipients({
    path: { generationId: input.generationId, postId: input.postId },
    ...(query ? { query } : {}),
    throwOnError: true,
  } satisfies Options<RecipientsData, true>);
  return data;
}
