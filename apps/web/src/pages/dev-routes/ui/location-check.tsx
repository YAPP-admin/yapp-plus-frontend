/** 개발 빌드에서만 연결하는 위치 RPC 검증 화면이다. 좌표 표시와 출석 제출은 제공하지 않는다. */

import { useSyncExternalStore } from 'react';
import { isNativeLocationEnvironment } from '@yapp-plus/app-bridge/web';
import { ActionButton } from '@yapp-plus/ui';
import { useLocationCheck } from '../model/use-location-check';
import { description, title } from '../../../shared/ui/page.css';
import { links } from '../../../shared/ui/page-links.css';

// WebView 환경은 페이지 수명 동안 고정이며 변경 구독은 필요하지 않다.
const subscribeEnvironment = () => () => {};
const serverEnvironment = () => false;

/** 부모는 화면 이탈 시 unmount해 이전 요청 결과가 재진입 화면에 반영되지 않게 한다. */
export function LocationCheck() {
  const isNative = useSyncExternalStore(
    subscribeEnvironment,
    isNativeLocationEnvironment,
    serverEnvironment,
  );
  const mutation = useLocationCheck();

  const disabled = !isNative || mutation.isPending;
  const status = {
    idle: '아직 요청하지 않았습니다.',
    pending: '요청 처리 중입니다.',
    error: '요청을 완료하지 못했습니다.',
    success: mutation.data,
  }[mutation.status];

  return (
    <section
      className={links}
      aria-labelledby="location-check-title"
      aria-busy={mutation.isPending}
    >
      <h2 id="location-check-title" className={title}>
        위치 브리지 확인
      </h2>
      <p className={description}>좌표를 표시하거나 저장하지 않으며 출석을 제출하지 않습니다.</p>
      {!isNative && <p className={description}>YAPP+ 앱에서 이용해 주세요.</p>}
      <ActionButton
        type="button"
        variant="neutralWeak"
        disabled={disabled}
        onClick={() => mutation.mutate('permission')}
      >
        권한 조회
      </ActionButton>
      <ActionButton
        type="button"
        variant="brandSolid"
        disabled={disabled}
        onClick={() => mutation.mutate('location')}
      >
        현재 위치 요청
      </ActionButton>
      <ActionButton
        type="button"
        variant="neutralWeak"
        disabled={disabled}
        onClick={() => mutation.mutate('settings')}
      >
        앱 설정 열기
      </ActionButton>
      <output className={description}>{status}</output>
    </section>
  );
}
