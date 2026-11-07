import { useEffect, useRef } from 'react';
import { useActivity } from '@stackflow/react';

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
    return () => {
      observer.disconnect();
    };
  }, [canLoad, isActive, load]);
  return loadMoreRef;
}
