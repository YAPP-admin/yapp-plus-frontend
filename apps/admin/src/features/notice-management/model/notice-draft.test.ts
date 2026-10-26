/** 저장 시 같은 값이 되는 입력과 실제로 달라지는 초안을 구별한다. */
import { expect, it } from 'vitest';
import { emptyNoticeForm, type NoticeFormValues } from './notice-form';
import { emptyNoticeDocument, getNoticeDraftSnapshot } from './notice-draft';

it('제목·제출 방법의 공백과 직군 선택 순서를 무시하고 미완성 제출 입력도 비교한다', () => {
  const initial: NoticeFormValues = {
    ...emptyNoticeForm,
    title: '제출 공지',
    category: 'submission',
    audience: ['Web', 'Server'],
  };
  const snapshot = getNoticeDraftSnapshot(initial, emptyNoticeDocument, []);

  expect(
    getNoticeDraftSnapshot(
      {
        ...initial,
        title: ' 제출 공지 ',
        audience: ['Server', 'Web'],
        submission: { ...initial.submission, method: { name: ' ', url: ' ' } },
      },
      emptyNoticeDocument,
      [],
    ),
  ).toBe(snapshot);
  expect(
    getNoticeDraftSnapshot(
      {
        ...initial,
        submission: { ...initial.submission, deadline: { date: '2026-11-01', time: '' } },
      },
      emptyNoticeDocument,
      [],
    ),
  ).not.toBe(snapshot);
});

it('일반 공지의 숨겨진 제출 값은 무시하고 본문 서식·첨부 제거와 순서 변경을 구별한다', () => {
  const body = {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: '본문' }] }],
  };
  const snapshot = getNoticeDraftSnapshot(emptyNoticeForm, body, ['a', 'b']);

  expect(
    getNoticeDraftSnapshot(
      {
        ...emptyNoticeForm,
        submission: { ...emptyNoticeForm.submission, method: { name: '숨긴 값', url: '' } },
      },
      body,
      ['a', 'b'],
    ),
  ).toBe(snapshot);
  expect(getNoticeDraftSnapshot(emptyNoticeForm, body, ['a'])).not.toBe(snapshot);
  expect(getNoticeDraftSnapshot(emptyNoticeForm, body, ['b', 'a'])).not.toBe(snapshot);
  expect(
    getNoticeDraftSnapshot(
      emptyNoticeForm,
      {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '본문' }] },
        ],
      },
      ['a', 'b'],
    ),
  ).not.toBe(snapshot);
});
