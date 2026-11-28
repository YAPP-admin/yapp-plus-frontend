/** 외부 URL 중 좌표 지도 링크만 카카오맵 앱으로 연결하고, 실패하면 원래 웹 링크로 복구한다. */

const MAP_PATH = /^\/link\/map\/(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?),(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)$/i;

function getKakaoMapAppUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (
      parsed.origin !== 'https://map.kakao.com' ||
      parsed.username ||
      parsed.password ||
      parsed.href.includes('?') ||
      parsed.href.includes('#')
    ) {
      return null;
    }
    const coordinates = MAP_PATH.exec(parsed.pathname);
    if (!coordinates) {
      return null;
    }
    const latitude = Number(coordinates[1]);
    const longitude = Number(coordinates[2]);
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180
    ) {
      return null;
    }
    return `kakaomap://look?p=${latitude},${longitude}`;
  } catch {
    return null;
  }
}

/**
 * OS의 URL 실행과 오류 안내를 주입받아 외부 탐색 함수를 만든다.
 * 호출자는 trusted origin을 먼저 구분한다. 같은 인스턴스에서 처리 중인 동일 URL은 무시하며,
 * 실행 완료 뒤에는 다시 열 수 있다. 앱 실행 실패 시 웹을 한 번 시도하고 최종 실패만 안내한다.
 */
export function createExternalNavigation(runtime: {
  openURL: (url: string) => Promise<unknown>;
  showError: () => void;
}): (url: string) => Promise<void> {
  const pendingUrls = new Set<string>();

  return async (url) => {
    if (pendingUrls.has(url)) {
      return;
    }
    pendingUrls.add(url);
    try {
      const appUrl = getKakaoMapAppUrl(url);
      if (appUrl) {
        try {
          await runtime.openURL(appUrl);
          return;
        } catch {
          // 미설치·실행 취소를 구분하지 않고 같은 목적지의 HTTPS 링크로 복구한다.
        }
      }
      await runtime.openURL(url);
    } catch {
      runtime.showError();
    } finally {
      pendingUrls.delete(url);
    }
  };
}
