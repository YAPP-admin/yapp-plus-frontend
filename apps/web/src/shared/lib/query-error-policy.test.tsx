/** 완료된 조회 오류의 경계 전파 예외를 작은 정책 단위로 검증한다. */
import { describe, expect, it } from 'vitest';
import { shouldThrowQueryError } from './query-error-policy';

describe('shouldThrowQueryError', () => {
  it('cache가 있는 조회라도 완료된 일반 오류는 경계로 전달한다', () => {
    expect(shouldThrowQueryError({ error: new Error('재조회 실패'), isFetching: false })).toBe(
      true,
    );
  });

  it('재시도 요청이 진행 중이면 기존 콘텐츠를 유지한다', () => {
    expect(shouldThrowQueryError({ error: new Error('이전 실패'), isFetching: true })).toBe(false);
  });

  it('다음 페이지 오류는 목록의 추가 페이지 안내가 처리하게 둔다', () => {
    expect(
      shouldThrowQueryError({
        error: new Error('다음 페이지 실패'),
        isFetching: false,
        isFetchNextPageError: true,
      }),
    ).toBe(false);
  });
});
