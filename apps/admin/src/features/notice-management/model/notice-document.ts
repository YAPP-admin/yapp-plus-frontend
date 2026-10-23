/** 편집기가 생성한 JSON을 그대로 보존하고 공백뿐인 본문만 거절한다. */
import type { JSONContent } from '@tiptap/core';
import { z } from 'zod';

/** 중첩된 본문에서 공백이 아닌 텍스트를 찾으면 즉시 탐색을 마친다. */
function hasBodyText(node: JSONContent): boolean {
  return Boolean(node.text?.trim()) || Boolean(node.content?.some(hasBodyText));
}

// 이 스키마는 Tiptap이 생성한 JSON 전용이다. 문서 구조·서식·속성을 다시 검증하거나 변환하지 않는다.
export const noticeDocumentSchema = z.custom<JSONContent>().refine(hasBodyText, {
  message: '공지 내용을 입력하세요.',
});
