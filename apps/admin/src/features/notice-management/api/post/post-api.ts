/** 생성 Admin Post SDK와 공지 등록·조회·수정·삭제 기능 사이의 요청 경계를 감싼다. */
import {
  create3,
  delete2,
  detail1,
  list,
  update2,
  type AdminPostDetailResponse,
  type AdminPostListResponse,
  type Create3Data,
  type CreatedPostResponse,
  type Delete2Data,
  type Detail1Data,
  type ListData,
  type Options,
  type Update2Data,
} from '@yapp-plus/api/generated';

export type ListAdminPostsInput = Readonly<{
  generationId: ListData['path']['generationId'];
  type?: NonNullable<ListData['query']>['type'];
  cursor?: NonNullable<ListData['query']>['cursor'];
}>;

export type GetAdminPostInput = Readonly<{
  generationId: Detail1Data['path']['generationId'];
  postId: Detail1Data['path']['postId'];
}>;

export type CreateAdminPostInput = Readonly<{
  generationId: Create3Data['path']['generationId'];
  idempotencyKey: Create3Data['headers']['Idempotency-Key'];
  body: Create3Data['body'];
}>;

export type UpdateAdminPostInput = Readonly<{
  generationId: Update2Data['path']['generationId'];
  postId: Update2Data['path']['postId'];
  body: Update2Data['body'];
}>;

export type DeleteAdminPostInput = Readonly<{
  generationId: Delete2Data['path']['generationId'];
  postId: Delete2Data['path']['postId'];
}>;

/** 기수의 공지를 cursor 기준으로 조회한다. 서버 DTO를 화면 모델로 변환하지 않는다. */
export async function listAdminPosts(input: ListAdminPostsInput): Promise<AdminPostListResponse> {
  const query =
    input.type === undefined && input.cursor === undefined
      ? undefined
      : { type: input.type, cursor: input.cursor };
  const { data } = await list({
    path: { generationId: input.generationId },
    ...(query ? { query } : {}),
    throwOnError: true,
  } satisfies Options<ListData, true>);
  return data;
}

/** 공지 한 건의 운영진 상세 정보를 조회한다. */
export async function getAdminPost(input: GetAdminPostInput): Promise<AdminPostDetailResponse> {
  const { data } = await detail1({
    path: { generationId: input.generationId, postId: input.postId },
    throwOnError: true,
  } satisfies Options<Detail1Data, true>);
  return data;
}

/** 공지 작성 요청과 Idempotency-Key를 함께 전달한다. */
export async function createAdminPost(input: CreateAdminPostInput): Promise<CreatedPostResponse> {
  const { data } = await create3({
    path: { generationId: input.generationId },
    headers: { 'Idempotency-Key': input.idempotencyKey },
    body: input.body,
    throwOnError: true,
  } satisfies Options<Create3Data, true>);
  return data;
}

/** 공지 제목·본문·이미지를 수정한다. 수정 시 앱 푸시는 다시 보내지 않는다. */
export async function updateAdminPost(
  input: UpdateAdminPostInput,
): Promise<AdminPostDetailResponse> {
  const { data } = await update2({
    path: { generationId: input.generationId, postId: input.postId },
    body: input.body,
    throwOnError: true,
  } satisfies Options<Update2Data, true>);
  return data;
}

/** 공지를 논리 삭제한다. 성공 응답 본문은 없는 204다. */
export async function deleteAdminPost(input: DeleteAdminPostInput): Promise<void> {
  await delete2({
    path: { generationId: input.generationId, postId: input.postId },
    throwOnError: true,
  } satisfies Options<Delete2Data, true>);
}
