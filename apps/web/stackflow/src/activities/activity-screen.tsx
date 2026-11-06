import { vars } from '@seed-design/css/vars';
import { useActivity } from '@stackflow/react';
import { SnackbarProvider } from '@yapp-plus/ui';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppBar } from '../../../seed-design/ui/app-bar';
import { AppScreen, AppScreenContent } from '../../../seed-design/ui/app-screen';
import { useAppScreenOptions } from '../platform';
import { statusBar, scrollStart } from './activity-screen.css';

export function ActivityScreen({
  children,
  preventSwipeBack,
  showBack: _showBack = true,
  title,
  background = 'layerDefault',
}: {
  children: ReactNode;
  preventSwipeBack?: boolean;
  showBack?: boolean;
  title: string;
  background?: 'layerDefault' | 'layerBasement';
}) {
  const appScreenOptions = useAppScreenOptions(preventSwipeBack);
  const { isTop } = useActivity();
  const layerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLSpanElement>(null);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const layer = layerRef.current;
    const start = startRef.current;
    if (!isTop || !layer || !start) {
      return () => {};
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          // 위로 당기는 바운스는 아래쪽 콘텐츠로 이동한 스크롤과 구분합니다.
          setAtTop(entry.boundingClientRect.top >= (entry.rootBounds?.top ?? 0));
        }
      },
      { root: layer, threshold: [0, 1] },
    );
    observer.observe(start);
    return () => observer.disconnect();
  }, [isTop]);

  return (
    <>
      {isTop ? <title>{`${title} | YAPP+`}</title> : null}
      <SnackbarProvider>
        <AppScreen
          {...appScreenOptions}
          layerOffsetTop="safeArea"
          tone={atTop ? 'transparent' : 'layer'}
          gradient={false}
          style={{ background: vars.$color.bg[background] }}
        >
          {/* 화면별 헤더는 유지하고 OS 상태바 영역만 스크롤 내용 위에 덮습니다. */}
          <AppBar className={statusBar} bg={vars.$color.bg[background]} aria-hidden="true" />
          <AppScreenContent ref={layerRef} style={{ background: vars.$color.bg[background] }}>
            <span ref={startRef} className={scrollStart} aria-hidden="true" />
            {children}
          </AppScreenContent>
        </AppScreen>
      </SnackbarProvider>
    </>
  );
}
