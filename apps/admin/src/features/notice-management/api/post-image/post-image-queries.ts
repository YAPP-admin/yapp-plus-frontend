/** 공지 이미지 presigned URL API의 mutation 옵션을 제공한다. */
import { presignAdminPostImage, type PresignAdminPostImageInput } from './post-image-api';

export function presignAdminPostImageMutationOptions(
  generationId: PresignAdminPostImageInput['generationId'],
) {
  return {
    mutationKey: ['admin', 'generations', generationId, 'post-images', 'presign'] as const,
    mutationFn: (input: PresignAdminPostImageInput['body']) =>
      presignAdminPostImage({ generationId, body: input }),
    retry: false,
  };
}
