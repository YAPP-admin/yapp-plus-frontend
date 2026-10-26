/** 공통 폼의 입력 상태와 본문을 제외한 메타데이터 검증을 정의한다. */
import { z } from 'zod';
import { noticeInputSchema, type Notice } from './notice';

const MILLISECONDS_PER_HOUR = 60 * 60 * 1_000;
// 한국 표준시는 UTC보다 9시간 빠르다.
const KOREA_UTC_OFFSET_MS = 9 * MILLISECONDS_PER_HOUR;

// 기존 공지 입력 규칙에서 본문·첨부를 제외한다. 두 입력의 연결은 작성·수정 페이지에서 담당한다.
export const noticeFormSchema = z.discriminatedUnion('category', [
  noticeInputSchema.options[0].omit({ bodyDocument: true, attachments: true }),
  noticeInputSchema.options[1].omit({ bodyDocument: true, attachments: true }),
]);

export type NoticeFormContent = z.output<typeof noticeFormSchema>;
type Input = z.input<typeof noticeFormSchema>;
type SubmissionInput = Extract<Input, { category: 'submission' }>;

/** 조건부 필드를 편집하는 동안에도 일정한 형태의 상태를 유지한다. */
export type NoticeFormValues = {
  title: string;
  category: Input['category'];
  audience: Input['audience'];
  submission: SubmissionInput['submission'];
};

/** 새 폼과 제출 종류 진입 시 사용하는 빈 제출 입력이다. */
export function emptySubmission(): SubmissionInput['submission'] {
  return { deadline: { date: '', time: '' }, method: { name: '', url: '' } };
}

export const emptyNoticeForm: NoticeFormValues = {
  title: '',
  category: 'session',
  audience: 'all',
  submission: emptySubmission(),
};

const errorMessages: Record<string, string> = {
  title: '제목을 앞뒤 공백 제외 1~60자로 입력하세요.',
  audience: '대상을 하나 이상 선택하세요.',
  'submission.deadline.date': '올바른 마감 날짜를 입력하세요.',
  'submission.deadline.time': '마감 시각을 입력하세요.',
  'submission.method.name': '제출 방법 이름을 입력하세요.',
  'submission.method.url': '제출 주소를 입력하세요.',
};

/** 스키마 오류를 폼의 필드별 한국어 메시지로 연결한다. */
export function validateNoticeForm(value: NoticeFormValues) {
  const result = noticeFormSchema.safeParse(value);

  if (result.success) {
    return undefined;
  }

  const fields: Record<string, string> = {};

  for (const issue of result.error.issues) {
    const path = issue.path.join('.');

    fields[path] = errorMessages[path] ?? '입력값을 확인하세요.';
  }

  return { fields };
}

/** 저장된 UTC 마감을 한국 시간 입력값으로 되돌린다. */
export function getNoticeFormValues(notice: Notice): NoticeFormValues {
  const submission = emptySubmission();

  if (notice.category === 'submission') {
    const koreanTime = new Date(
      new Date(notice.submission.deadlineAt).getTime() + KOREA_UTC_OFFSET_MS,
    ).toISOString();

    submission.deadline = { date: koreanTime.slice(0, 10), time: koreanTime.slice(11, 16) };
    submission.method = notice.submission.method ?? { name: '', url: '' };
  }

  return { title: notice.title, category: notice.category, audience: notice.audience, submission };
}
