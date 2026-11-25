/** 저장된 첨부를 SEED의 읽기 전용 미리보기로 표시한다. */
import { Text, VStack } from '@seed-design/react';
import type { PostImageResponse } from '@yapp-plus/api/generated';

/** 조회된 첨부가 바뀌면 최신 파일 목록을 전달한다. */
export function NoticeAttachments({ images }: { images: PostImageResponse[] }) {
  if (images.length === 0) {
    return null;
  }

  return (
    <VStack gap="x2">
      <Text as="h3" fontWeight="bold">
        첨부 이미지
      </Text>
      <ul>
        {images.map((image) => (
          <li key={image.imageKey}>
            {image.readUrl ? <img src={image.readUrl} alt={image.filename} width={160} /> : null}
            <Text as="span">{image.filename}</Text>
          </li>
        ))}
      </ul>
    </VStack>
  );
}
