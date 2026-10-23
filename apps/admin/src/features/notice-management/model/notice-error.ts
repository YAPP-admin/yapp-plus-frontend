/** 화면에서 검증 실패·없는 공지·사용 불가·기타 실패를 구분하는 오류다. */
export class NoticeError extends Error {
  /** 실패 원인 코드와 사용자에게 표시할 메시지를 함께 보관한다. */
  constructor(
    public readonly code: 'validation' | 'not-found' | 'unavailable' | 'unknown',
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'NoticeError';
  }
}
