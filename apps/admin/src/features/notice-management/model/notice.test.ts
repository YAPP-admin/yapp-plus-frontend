/**
 * 5a 공지 데이터 규칙의 경계 조건과 Tiptap JSON 왕복을 검증한다.
 * 합성 회원과 고정 시각을 사용하며 실제 API·저장소·브라우저 입력 검증은 포함하지 않는다.
 */
import { describe, expect, it } from 'vitest';
import { noticeDocumentSchema } from './notice-document';
import { noticeContentSchema, noticeInputSchema, noticeSchema, type Member } from './notice';
import { getNoticeAudience, reconcileReadRecords } from './notice-audience';
import { getNoticeDeadline, getNoticeReaders, getNoticeSummary } from './notice-summary';

const bodyDocument = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: '공지 본문' }] }],
};
const general = { category: 'session', title: ' 공지 ', bodyDocument, audience: 'all' };
const submission = {
  ...general,
  category: 'submission',
  submission: {
    deadline: { date: '2026-10-23', time: '09:30' },
    method: { name: '', url: '' },
  },
};
const readAt = '2026-10-22T00:00:00.000Z';
const members: Member[] = [
  { id: 'a', name: '가상가', cohort: 30, job: 'Web', membership: 'active' },
  { id: 'b', name: '가상나', cohort: 30, job: 'Design', membership: 'active' },
  { id: 'c', name: '가상다', cohort: 29, job: 'Web', membership: 'regular' },
  { id: 'd', name: '가상라', cohort: 28, job: 'Server', membership: 'completed' },
];

describe('공지 입력·저장 경계', () => {
  it('제목을 정리하고 일반 공지에서 제출 전용 입력을 제거한다', () => {
    const result = noticeInputSchema.parse({ ...general, submission: submission.submission });
    expect(result.title).toBe('공지');
    expect(result).not.toHaveProperty('submission');
  });
  it.each(['', '   ', '가'.repeat(61)])('유효하지 않은 제목을 거절한다: %j', (title) => {
    expect(noticeInputSchema.safeParse({ ...general, title }).success).toBe(false);
  });
  it('60자 제목을 허용한다', () => {
    expect(noticeInputSchema.safeParse({ ...general, title: '가'.repeat(60) }).success).toBe(true);
  });
  it('한국 시간 입력을 UTC로 변환하고 빈 제출 방법은 null로 저장한다', () => {
    const result = noticeInputSchema.parse(submission);
    expect(result).toMatchObject({
      submission: { deadlineAt: '2026-10-23T00:30:00.000Z', method: null },
    });
    expect(noticeContentSchema.parse(result)).toEqual(result);
  });
  it.each([
    { date: '', time: '09:30' },
    { date: '2026-10-23', time: '' },
    { date: '2026-02-30', time: '09:30' },
    { date: '2026-10-23', time: '24:00' },
  ])('없는 날짜·시간과 잘못된 날짜·시간을 거절한다: %j', (deadline) => {
    expect(
      noticeInputSchema.safeParse({
        ...submission,
        submission: { ...submission.submission, deadline },
      }).success,
    ).toBe(false);
  });
  it('과거 마감과 윤년을 허용한다', () => {
    expect(
      noticeInputSchema.parse({
        ...submission,
        submission: { ...submission.submission, deadline: { date: '2024-02-29', time: '00:00' } },
      }),
    ).toMatchObject({ submission: { deadlineAt: '2024-02-28T15:00:00.000Z' } });
  });
  it.each([
    { name: '방법', url: '' },
    { name: '', url: 'https://example.com' },
  ])('불완전한 제출 방법을 거절한다: %j', (method) => {
    expect(
      noticeInputSchema.safeParse({
        ...submission,
        submission: { ...submission.submission, method },
      }).success,
    ).toBe(false);
  });
  it.each(['mailto:team@example.com', '/submission', '주소 입력'])(
    '제출 URL은 형식 검사 없이 입력값을 보존한다: %s',
    (url) => {
      expect(
        noticeInputSchema.parse({
          ...submission,
          submission: { ...submission.submission, method: { name: '방법', url } },
        }),
      ).toMatchObject({ submission: { method: { name: '방법', url } } });
    },
  );
  it('제출 방법의 앞뒤 공백을 제거한다', () => {
    expect(
      noticeInputSchema.parse({
        ...submission,
        submission: {
          ...submission.submission,
          method: { name: ' 방법 ', url: ' https://example.com ' },
        },
      }),
    ).toMatchObject({ submission: { method: { name: '방법', url: 'https://example.com' } } });
  });
  it.each([
    { audience: [] },
    { audience: ['all', 'Web'] },
    { audience: ['unknown'] },
    { audience: 'regular' },
  ])('잘못된 제출 대상을 거절한다: %j', ({ audience }) => {
    expect(noticeInputSchema.safeParse({ ...submission, audience }).success).toBe(false);
  });
  it('제출 직군 중복을 제거한다', () => {
    expect(
      noticeInputSchema.parse({ ...submission, audience: ['Web', 'Web', 'Design'] }).audience,
    ).toEqual(['Web', 'Design']);
  });
  it('저장 메타데이터를 검증한다', () => {
    const saved = {
      ...general,
      id: 'notice-1',
      createdAt: readAt,
      readAtByMemberId: { a: readAt },
      unansweredCount: 0,
    };
    expect(noticeSchema.safeParse(saved).success).toBe(true);
    expect(noticeSchema.safeParse({ ...saved, unansweredCount: -1 }).success).toBe(false);
    expect(noticeSchema.safeParse({ ...saved, readAtByMemberId: { a: '어제' } }).success).toBe(
      false,
    );
  });
});

describe('본문 필수 입력', () => {
  it.each([
    { type: 'doc', content: [{ type: 'paragraph' }] },
    { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: ' \n ' }] }] },
    { type: 'doc', content: [{ type: 'horizontalRule' }] },
    {
      type: 'doc',
      content: [
        { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph' }] }] },
      ],
    },
  ])('텍스트가 없거나 공백뿐이면 거절한다: %j', (document) => {
    expect(noticeDocumentSchema.safeParse(document).success).toBe(false);
  });
  it('중첩된 목록의 텍스트를 확인하고 원본 JSON을 그대로 반환한다', () => {
    const document = {
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: '공지', marks: [{ type: 'bold' }] }],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(noticeDocumentSchema.parse(document)).toBe(document);
  });
});

describe('대상과 읽음 계산', () => {
  it.each([
    ['all', ['a', 'b', 'c', 'd']],
    ['active', ['a', 'b']],
    ['regular', ['c']],
    ['completed', ['d']],
  ])('일반 대상 %s를 구분한다', (audience, expected) => {
    expect(
      getNoticeAudience(noticeInputSchema.parse({ ...general, audience }), members).map(
        ({ id }) => id,
      ),
    ).toEqual(expected);
  });
  it('제출 대상은 활동회원 안에서만 선택한다', () => {
    expect(
      getNoticeAudience(noticeInputSchema.parse(submission), members).map(({ id }) => id),
    ).toEqual(['a', 'b']);
    expect(
      getNoticeAudience(
        noticeInputSchema.parse({ ...submission, audience: ['Web', 'Server'] }),
        members,
      ).map(({ id }) => id),
    ).toEqual(['a']);
  });
  it('교집합만 보존하고 새 대상·재추가 대상은 미열람으로 만든다', () => {
    const previous = members.slice(0, 2);
    const next = members.slice(1, 3);
    const records = reconcileReadRecords({ a: readAt, b: readAt, c: readAt }, previous, next);
    expect(records).toEqual({ b: readAt, c: null });
    expect(reconcileReadRecords(records, next, members)).toEqual({
      a: null,
      b: readAt,
      c: null,
      d: null,
    });
    expect(reconcileReadRecords(records, next, next)).toEqual(records);
    expect(reconcileReadRecords(records, next, [])).toEqual({});
  });
  it('현재 대상만 집계하고 반올림하며 대상 0명은 0으로 계산한다', () => {
    expect(getNoticeSummary(members.slice(0, 3), { a: readAt, d: readAt })).toEqual({
      targetCount: 3,
      readCount: 1,
      unreadCount: 2,
      readPercentage: 33,
    });
    expect(getNoticeSummary([], { a: readAt })).toEqual({
      targetCount: 0,
      readCount: 0,
      unreadCount: 0,
      readPercentage: 0,
    });
  });
  it('읽은 회원은 시각 내림차순, 미열람은 이름순이며 동률은 id순이다', () => {
    const input = members.reduce<Member[]>((result, member) => [member, ...result], []);
    expect(
      getNoticeReaders(input, { a: readAt, c: '2026-10-23T00:00:00.000Z' }).map(
        ({ member }) => member.id,
      ),
    ).toEqual(['c', 'a', 'b', 'd']);
    expect(
      getNoticeReaders(input, { a: readAt, c: readAt }).map(({ member }) => member.id),
    ).toEqual(['a', 'c', 'b', 'd']);
    expect(
      getNoticeReaders(
        input.map((member) => ({ ...member, name: '동명' })),
        {},
      ).map(({ member }) => member.id),
    ).toEqual(['a', 'b', 'c', 'd']);
    expect(input.map(({ id }) => id)).toEqual(['d', 'c', 'b', 'a']);
  });
});

describe('한국 시간 마감', () => {
  it.each([
    ['2026-10-22T14:59:59.999Z', 'D-1'],
    ['2026-10-22T15:00:00.000Z', 'D-day'],
    ['2026-10-23T00:29:59.999Z', 'D-day'],
    ['2026-10-23T00:30:00.000Z', '마감'],
    ['2026-10-23T00:30:00.001Z', '마감'],
  ])('%s에 %s를 반환한다', (now, expected) => {
    expect(getNoticeDeadline('2026-10-23T00:30:00.000Z', new Date(now))).toBe(expected);
  });
  it('남은 24시간이 아닌 한국 날짜 차이를 사용한다', () => {
    expect(getNoticeDeadline('2026-10-24T14:59:00Z', new Date('2026-10-22T15:00:00Z'))).toBe('D-1');
  });
  it('잘못된 시각을 거절한다', () => {
    expect(() => getNoticeDeadline('invalid', new Date())).toThrow(
      '올바른 마감·현재 시각이 필요합니다.',
    );
    expect(() => getNoticeDeadline(readAt, new Date('invalid'))).toThrow(
      '올바른 마감·현재 시각이 필요합니다.',
    );
  });
});
