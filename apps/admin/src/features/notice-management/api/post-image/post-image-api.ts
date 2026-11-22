/** 생성 Admin Post SDK와 공지 이미지 presigned URL 발급 사이의 요청 경계를 감싼다. */
import {
  presign1,
  type Options,
  type Presign1Data,
  type PresignPostImageResponse,
} from '@yapp-plus/api/generated';

export type PresignAdminPostImageInput = Readonly<{
  generationId: Presign1Data['path']['generationId'];
  body: Presign1Data['body'];
}>;

/** 공지 이미지 저장을 위한 presigned PUT URL을 발급한다. */
export async function presignAdminPostImage(
  input: PresignAdminPostImageInput,
): Promise<PresignPostImageResponse> {
  const { data } = await presign1({
    path: { generationId: input.generationId },
    body: input.body,
    throwOnError: true,
  } satisfies Options<Presign1Data, true>);
  return data;
}
