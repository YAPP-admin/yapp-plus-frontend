const koreanDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function koreanDateString(now: number): string {
  return koreanDate.format(new Date(now));
}

export function koreanTimestamp(date: string, time = '00:00'): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(time)) {
    throw new Error('올바르지 않은 날짜 또는 시간입니다.');
  }
  const timestamp = Date.parse(`${date}T${time}+09:00`);
  if (!Number.isFinite(timestamp) || koreanDateString(timestamp) !== date) {
    throw new Error('올바르지 않은 날짜입니다.');
  }
  return timestamp;
}

export function formatKoreanTime(time: string): string {
  koreanTimestamp('2000-01-01', time);
  const hour = Number(time.slice(0, 2));
  const minute = Number(time.slice(3, 5));
  return `${hour < 12 ? '오전' : '오후'} ${hour % 12 || 12}시${minute ? ` ${minute}분` : ''}`;
}

export function nextKoreanMidnight(date: string): number {
  return koreanTimestamp(date) + 86_400_000;
}
