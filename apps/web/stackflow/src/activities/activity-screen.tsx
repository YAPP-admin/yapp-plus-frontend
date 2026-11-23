import { useActivity } from '@stackflow/react';
import { vars } from '@seed-design/css/vars';
import { SnackbarProvider } from '@yapp-plus/ui';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ScreenActiveContext } from '@/shared/lib/screen-activity';
import { AppBar } from '../../../seed-design/ui/app-bar';
import { AppScreen, AppScreenContent } from '../../../seed-design/ui/app-screen';
import { useAppScreenOptions } from '../platform';
import { screen, screenBasement, scrollLayer, scrollStart, statusBar } from './activity-screen.css';

const SAFE_AREA_SNACKBAR_REGION_STYLE = {
  bottom: `calc(var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + ${vars.$dimension.x4})`,
  '--snackbar-region-offset': vars.$dimension.x4,
} as CSSProperties;

export function ActivityScreen({
  children,
  preventSwipeBack,
  showBack: _showBack = true,
  title,
  background = 'layerDefault',
  snackbarPosition = 'aboveBottomNavigation',
}: {
  children: ReactNode;
  preventSwipeBack?: boolean;
  showBack?: boolean;
  title: string;
  background?: 'layerDefault' | 'layerBasement';
  snackbarPosition?: 'aboveBottomNavigation' | 'safeArea';
}) {
  const appScreenOptions = useAppScreenOptions(preventSwipeBack);
  const { isTop, isActive } = useActivity();
  const layerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLSpanElement>(null);
  const [atTop, setAtTop] = useState(true);
  const backgroundClassName = background === 'layerBasement' ? screenBasement : screen;

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
      <SnackbarProvider
        regionStyle={snackbarPosition === 'safeArea' ? SAFE_AREA_SNACKBAR_REGION_STYLE : undefined}
      >
        <AppScreen
          {...appScreenOptions}
          layerOffsetTop="safeArea"
          tone={atTop ? 'transparent' : 'layer'}
          gradient={false}
          className={backgroundClassName}
        >
          {/* 화면별 헤더는 유지하고 OS 상태바 영역만 스크롤 내용 위에 덮습니다. */}
          <AppBar className={`${statusBar} ${backgroundClassName}`} aria-hidden="true" />
          <AppScreenContent ref={layerRef} className={`${scrollLayer} ${backgroundClassName}`}>
            <span ref={startRef} className={scrollStart} aria-hidden="true" />
            <ScreenActiveContext value={isActive}>{children}</ScreenActiveContext>
          </AppScreenContent>
        </AppScreen>
      </SnackbarProvider>
    </>
  );
}
