/** 공지 등록·조회·수정·삭제 API의 query key와 mutation 옵션을 제공한다. */
import { queryOptions } from '@tanstack/react-query';
import {
  detail1QueryKey,
  listQueryKey,
  type CreateAdminPostRequest,
} from '@yapp-plus/api/generated';
import {
  createAdminPost,
  deleteAdminPost,
  getAdminPost,
  listAdminPosts,
  updateAdminPost,
  type CreateAdminPostInput,
  type DeleteAdminPostInput,
  type GetAdminPostInput,
  type ListAdminPostsInput,
  type UpdateAdminPostInput,
} from './post-api';

export function adminPostsQueryKey(input: ListAdminPostsInput) {
  return listQueryKey({
    path: { generationId: input.generationId },
    query: { type: input.type, cursor: input.cursor },
  });
}

export function adminPostsQueryOptions(input: ListAdminPostsInput) {
  return queryOptions({
    queryKey: adminPostsQueryKey(input),
    queryFn: () => listAdminPosts(input),
    retry: false,
  });
}

export function adminPostQueryKey(input: GetAdminPostInput) {
  return detail1QueryKey({
    path: { generationId: input.generationId, postId: input.postId },
  });
}

export function adminPostQueryOptions(input: GetAdminPostInput) {
  return queryOptions({
    queryKey: adminPostQueryKey(input),
    queryFn: () => getAdminPost(input),
    retry: false,
  });
}

export function createAdminPostMutationOptions(
  generationId: CreateAdminPostInput['generationId'],
  idempotencyKey: CreateAdminPostInput['idempotencyKey'],
) {
  return {
    mutationKey: ['admin', 'generations', generationId, 'posts', 'create'] as const,
    mutationFn: (body: CreateAdminPostRequest) =>
      createAdminPost({ generationId, idempotencyKey, body }),
    retry: false,
  };
}

export function updateAdminPostMutationOptions(
  input: Pick<UpdateAdminPostInput, 'generationId' | 'postId'>,
) {
  return {
    mutationKey: [
      'admin',
      'generations',
      input.generationId,
      'posts',
      input.postId,
      'update',
    ] as const,
    mutationFn: (body: UpdateAdminPostInput['body']) => updateAdminPost({ ...input, body }),
    retry: false,
  };
}

export function deleteAdminPostMutationOptions(input: DeleteAdminPostInput) {
  return {
    mutationKey: [
      'admin',
      'generations',
      input.generationId,
      'posts',
      input.postId,
      'delete',
    ] as const,
    mutationFn: () => deleteAdminPost(input),
    retry: false,
  };
}
