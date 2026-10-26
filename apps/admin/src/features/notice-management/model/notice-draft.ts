/** 저장에 영향을 주는 초안 값만 비교하며, 유효하지 않은 작성 중 입력도 보존한다. */
import type { JSONContent } from '@tiptap/core';
import type { NoticeFormValues } from './notice-form';

// Tiptap이 빈 편집기에 만드는 기본 문단과 같은 형태다.
export const emptyNoticeDocument: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

/** 직군 선택 순서·저장 시 제거되는 공백은 무시하고 본문 서식·첨부 순서는 유지한다. */
export function getNoticeDraftSnapshot(
  values: NoticeFormValues,
  bodyDocument: JSONContent,
  attachmentIds: string[],
) {
  return JSON.stringify({
    title: values.title.trim(),
    category: values.category,
    audience: Array.isArray(values.audience) ? values.audience.toSorted() : values.audience,
    submission:
      values.category === 'submission'
        ? {
            deadline: values.submission.deadline,
            method: {
              name: values.submission.method.name.trim(),
              url: values.submission.method.url.trim(),
            },
          }
        : null,
    bodyDocument,
    attachmentIds,
  });
}
