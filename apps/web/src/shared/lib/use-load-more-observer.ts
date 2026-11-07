/** Stackflow Activity 수명에 맞춰 다음 페이지 관찰기를 연결하는 공용 hook이다. */
import { useActivity } from '@stackflow/react';
import { useEffect, useRef } from 'react';

/**
 * 무한 목록 화면이 Stackflow의 hidden Activity일 때 관찰기를 해제한다.
 * 출석 내역에서 검증한 구현을 공지 목록도 소비하도록 shared에 둔다.
 */
export function useLoadMoreObserver(canLoad: boolean, load: () => void) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { isActive } = useActivity();

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!isActive || !canLoad || !target) {
      return () => {};
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          load();
        }
      },
      { rootMargin: '100px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [canLoad, isActive, load]);

  return loadMoreRef;
}
