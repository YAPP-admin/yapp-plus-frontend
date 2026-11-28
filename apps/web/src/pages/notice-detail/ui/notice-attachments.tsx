/** 공지 첨부 이미지를 원본 순서대로 표시하고 탐색은 브라우저 기본 스크롤에 맡긴다. */
import { ImageFrame, Skeleton } from '@seed-design/react';
import { skeletonPlaceholder } from '@/shared/ui/skeleton.css';
import type { MemberNoticeDetail } from '../model/notice-detail-query';
import {
  attachmentFallback,
  attachmentLoading,
  attachmentImage,
  attachmentItem,
  attachmentSection,
} from './notice-detail-page.css';

/** 이미지 순서와 대체 텍스트를 유지하며, 이미지가 없으면 영역을 표시하지 않는다. */
export function NoticeAttachments({ images }: { images: MemberNoticeDetail['images'] }) {
  if (!images.length) {
    return null;
  }

  return (
    <section className={attachmentSection} aria-label="첨부 이미지">
      {images.map((image, index) => (
        <figure
          key={image.imageKey}
          className={attachmentItem}
          aria-label={`${images.length}장 중 ${index + 1}번째 이미지`}
        >
          <NoticeAttachmentImage key={image.readUrl} src={image.readUrl} alt={image.filename} />
        </figure>
      ))}
    </section>
  );
}

function NoticeAttachmentImage({ src, alt }: { src: string; alt: string }) {
  return (
    <ImageFrame
      className={attachmentImage}
      ratio={4 / 5}
      borderRadius={0}
      stroke={false}
      src={src}
      alt={alt}
      fallback={
        <>
          <Skeleton
            className={`${skeletonPlaceholder} ${attachmentLoading}`}
            width="full"
            height="full"
            radius="0"
            aria-hidden="true"
          />
          <div className={attachmentFallback}>이미지를 표시하지 못했어요.</div>
        </>
      }
    />
  );
}
