/** 공지 조회 실패를 페이지 탐색과 분리해 일관된 안내 콘텐츠로 보여준다. */
import {
  content,
  description,
  graphicContainer,
  title,
  titleGroup,
} from './notice-error-content.css';
import { NoticeErrorIllustration } from './notice-error-illustration';

/** 공지 조회 오류의 제목·설명만 받아 렌더링하는 탐색 비의존 콘텐츠다. */
export function NoticeErrorContent({
  titleText = '앗, 오류가 발생했어요!',
  descriptionText = '잠시 후 다시 시도해 주세요.',
}: {
  titleText?: string;
  descriptionText?: string;
}) {
  return (
    <div className={content}>
      <div className={titleGroup}>
        <h1 className={title}>{titleText}</h1>
        <p className={description}>{descriptionText}</p>
      </div>

      <div className={graphicContainer}>
        <NoticeErrorIllustration />
      </div>
    </div>
  );
}
