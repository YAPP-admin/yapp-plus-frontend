import { koreanTimestamp } from '@/shared/lib/korean-date-time';

/** 알림함의 발송 날짜를 목록에 표시할 한국어 날짜 문구로 변환한다. */
export function alertSentDateLabel(sentDate: string): string {
  const timestamp = koreanTimestamp(sentDate);
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
  }).format(new Date(timestamp));
}
