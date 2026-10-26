/**
 * 공지 입력·저장 데이터의 Zod 스키마와 타입을 정의한다.
 * 폼의 날짜·시간·빈 문자열을 저장 형태로 정규화하며 실제 저장이나 API 호출은 수행하지 않는다.
 */
import { z } from 'zod';
import { noticeDocumentSchema } from './notice-document';
import { MAX_NOTICE_ATTACHMENTS } from './notice-attachments';

/** 회원의 직군이며, 제출 공지에서 선택 가능한 직군과 같은 값을 사용한다. */
export const noticeJobSchema = z.enum(['PM', 'Design', 'Mobile', 'Web', 'Server', 'AI Native']);

/** 회원 구분: active 활동회원, regular 정회원, completed 수료회원. */
export const membershipSchema = z.enum(['active', 'regular', 'completed']);

/** 대상 계산에 필요한 합성 회원 정보다. 실제 회원 API 계약을 변경하지 않는다. */
export const memberSchema = z.object({
  /** 회원 식별자. 대상 선정과 읽음 기록을 연결하는 키다. */
  id: z.string().min(1),
  /** 읽음 현황 표에 표시할 회원 이름. */
  name: z.string().min(1),
  /** 회원 기수. 예: 30은 30기를 뜻하며 양의 정수로 저장한다. */
  cohort: z.number().int().positive(),
  /** 회원 직군. 제출 공지의 직군별 대상 선정과 읽음 표에 사용한다. */
  job: noticeJobSchema,
  /** 회원 구분. 일반 공지의 대상 선정 및 제출 공지의 활동회원 제한에 사용한다. */
  membership: membershipSchema,
});

/** 일반 공지 대상: all 전체 회원 또는 특정 회원 구분 하나. */
const generalAudience = z.enum(['all', 'active', 'regular', 'completed']);

// 전체 선택과 개별 직군 배열을 별도 형태로 표현하고, 개별 선택은 하나 이상·중복 없이 저장한다.
const submissionAudience = z.union([
  z.literal('all'),
  z
    .array(noticeJobSchema)
    .min(1)
    .transform((jobs) => [...new Set(jobs)]),
]);

const methodSchema = z.object({
  /** 제출 방법의 표시 이름. 예: 과제 제출 폼. */
  name: z.string().trim().min(1),
  /** 제출 주소 입력값. 공백만 제거하고 URL 형식·프로토콜은 검사하지 않는다. */
  url: z.string().trim().min(1),
});

/** 저장된 이미지. URL은 화면이 소유하며 원본 Blob과 파일명만 보관한다. */
const noticeAttachmentSchema = z.object({
  /** 수정과 미리보기 목록에서 항목을 구분한다. */
  id: z.string().min(1),
  /** 미리보기와 상세 화면에 표시할 원래 파일명이다. */
  name: z.string().min(1),
  /** 실제 이미지 데이터와 MIME 타입·크기를 가진 불변 객체다. */
  blob: z.instanceof(Blob),
});

export type NoticeAttachment = z.infer<typeof noticeAttachmentSchema>;

const common = {
  /** 목록·상세에 표시하는 제목. 앞뒤 공백 제거 후 1~60자다. */
  title: z.string().trim().min(1).max(60),
  /** 서식이 포함된 Tiptap JSON 본문. 편집기가 만든 JSON을 그대로 보존하고 빈 본문만 거절한다. */
  bodyDocument: noticeDocumentSchema,
  /** 첨부가 없는 기존 공지는 생략할 수 있다. 파일 검증은 선택 단계에서 수행한다. */
  attachments: noticeAttachmentSchema.array().max(MAX_NOTICE_ATTACHMENTS).optional(),
};

/** 정규화된 공지 내용의 저장 규칙이다. 일반 공지는 제출 전용 필드를 제거한다. */
export const noticeContentSchema = z.discriminatedUnion('category', [
  z.object({
    ...common,
    /** 일반 공지 종류: session 세션, operation 운영. */
    category: z.enum(['session', 'operation']),
    /** 전체 회원 또는 활동·정·수료회원 중 하나를 선택한다. */
    audience: generalAudience,
  }),
  z.object({
    ...common,
    /** 제출 공지임을 나타내며 제출 전용 입력을 활성화하는 구분값이다. */
    category: z.literal('submission'),
    /** 활동회원 전체(all) 또는 하나 이상의 직군 배열. 전체와 개별 직군은 함께 선택할 수 없다. */
    audience: submissionAudience,
    /** 제출 공지에만 저장하는 마감과 선택적 제출 방법. */
    submission: z.object({
      /** 마감 시각. 한국 시간 입력을 UTC ISO 문자열로 변환한 값이다. */
      deadlineAt: z.iso.datetime(),
      /** 제출 방법 이름·주소. 지정하지 않았으면 null이다. */
      method: methodSchema.nullable(),
    }),
  }),
]);

// 한국 날짜와 분 단위 시각을 검증한 뒤 UTC ISO 문자열로 변환한다. 과거 시각도 허용한다.
const koreanDeadlineSchema = z
  .object({
    /** 한국 시간 기준 마감 날짜. YYYY-MM-DD 형식이다. */
    date: z.iso.date(),
    /** 한국 시간 기준 마감 시각. HH:mm 형식이며 초는 입력하지 않는다. */
    time: z.iso.time({ precision: -1 }),
  })
  .transform(({ date, time }) => new Date(`${date}T${time}:00+09:00`).toISOString());

// 제출 방법을 둘 다 비우면 null로 바꾸고, 하나라도 입력하면 이름과 URL 입력을 모두 요구한다. URL 형식·프로토콜은 검사하지 않는다.
const methodInputSchema = z
  .object({
    /** 제출 방법 이름 입력. 주소와 함께 비워 두면 제출 방법을 지정하지 않는다. */
    name: z.string().trim(),
    /** 제출 주소 입력. 이름을 입력했다면 이 값도 필요하다. */
    url: z.string().trim(),
  })
  .transform((method) => (!method.name && !method.url ? null : method))
  .pipe(methodSchema.nullable());

// 입력 상태와 저장 모델을 분리해 종류 전환 후 남은 제출 필드를 제거한다.
export const noticeInputSchema = z.discriminatedUnion('category', [
  z.object({
    ...common,
    /** 일반 공지 종류: session 세션, operation 운영. */
    category: z.enum(['session', 'operation']),
    /** 전체 회원 또는 활동·정·수료회원 중 하나를 선택한다. */
    audience: generalAudience,
  }),
  z.object({
    ...common,
    /** 제출 공지임을 나타내며 제출 전용 입력을 활성화하는 구분값이다. */
    category: z.literal('submission'),
    /** 활동회원 전체(all) 또는 하나 이상의 직군 배열. 전체와 개별 직군은 함께 선택할 수 없다. */
    audience: submissionAudience,
    /** 폼에서 받은 제출 정보. 변환 후에는 저장 모델의 필드 형태를 따른다. */
    submission: z
      .object({
        /** 날짜·시간 입력을 받아 UTC 마감 시각으로 변환한다. */
        deadline: koreanDeadlineSchema,
        /** 이름·주소 입력을 받아 제출 방법 객체 또는 null로 변환한다. */
        method: methodInputSchema,
      })
      .transform(({ deadline, method }) => ({ deadlineAt: deadline, method })),
  }),
]);

/** 회원 ID별 최초 확인 시각을 저장한다. null은 미열람을 뜻한다. */
export const readRecordsSchema = z.record(z.string(), z.iso.datetime().nullable());

/** 내용과 저장 메타데이터를 함께 검증한다. 첨부 Blob은 객체 URL과 분리해 보존한다. */
export const noticeSchema = noticeContentSchema.and(
  z.object({
    /** 공지 식별자. 상세·수정 경로 및 저장소 조회에 사용한다. */
    id: z.string().min(1),
    /** 최초 작성 시각의 UTC ISO 문자열. 수정해도 유지하며 최신순 정렬에 사용한다. */
    createdAt: z.iso.datetime(),
    /** 회원 ID별 최초 확인 시각. 값이 null이면 미열람이다. */
    readAtByMemberId: readRecordsSchema,
    /** 목록 카드에 표시할 미답변 질문 수. 새 공지는 0으로 시작한다. */
    unansweredCount: z.number().int().nonnegative(),
  }),
);

export type NoticeContent = z.infer<typeof noticeContentSchema>;

export type Notice = z.infer<typeof noticeSchema>;

export type Member = z.infer<typeof memberSchema>;

export type ReadRecords = z.infer<typeof readRecordsSchema>;
