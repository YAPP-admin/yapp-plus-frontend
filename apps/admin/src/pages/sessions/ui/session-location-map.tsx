/** 마커 드래그와 초기 위치 복귀로 좌표를 조정합니다. 최종 좌표는 부모 폼이 소유합니다. */
import { useEffect, useEffectEvent, useState } from 'react';
import { ActionButton } from '@yapp-plus/ui';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import type { CoordinatesViewModel } from '../model/location/location-view-model';
import { getKakaoMapKey } from '../model/location/location-config';
import * as styles from './session-location-map.css';

type Props = {
  initialPosition: CoordinatesViewModel;
  position: CoordinatesViewModel;
  onChange: (value: CoordinatesViewModel) => void;
  disabled?: boolean;
};

export function SessionLocationMap({
  initialPosition,
  position,
  onChange,
  disabled = false,
}: Props) {
  const appkey = getKakaoMapKey();

  function applyPosition(next: CoordinatesViewModel) {
    if (disabled) {
      return;
    }
    onChange(next);
  }

  return (
    <section className={styles.root} aria-label="세션 위치 조정">
      <p className={styles.hint}>마커를 드래그해 위치를 조정하세요.</p>
      {appkey ? (
        <LocationMapCanvas
          appkey={appkey}
          center={position}
          disabled={disabled}
          onMove={applyPosition}
        />
      ) : (
        <p role="alert">지도 설정이 준비되지 않았습니다. 현재 좌표는 유지됩니다.</p>
      )}
      <dl className={styles.coordinates}>
        <div>
          <dt className={styles.hint}>위도</dt>
          <dd className={styles.value}>{position.latitude.toFixed(7)}</dd>
        </div>
        <div>
          <dt className={styles.hint}>경도</dt>
          <dd className={styles.value}>{position.longitude.toFixed(7)}</dd>
        </div>
      </dl>
      <div className={styles.actions}>
        <ActionButton
          type="button"
          variant="neutralWeak"
          disabled={disabled}
          onClick={() => applyPosition(initialPosition)}
        >
          초기 위치로 되돌리기
        </ActionButton>
      </div>
    </section>
  );
}

/** 스크립트 로딩은 SDK 기본 훅에 맡기고 지도 실패 시에도 현재 좌표는 유지합니다. */
function LocationMapCanvas({
  appkey,
  center,
  disabled,
  onMove,
}: {
  appkey: string;
  center: CoordinatesViewModel;
  disabled: boolean;
  onMove: (value: CoordinatesViewModel) => void;
}) {
  const [loading, error] = useKakaoLoader({ appkey });
  const [map, setMap] = useState<Pick<kakao.maps.Map, 'getNode' | 'relayout' | 'setCenter'> | null>(
    null,
  );
  const relayout = useEffectEvent(() => {
    map?.relayout();
    map?.setCenter(new kakao.maps.LatLng(center.latitude, center.longitude));
  });
  useEffect(() => {
    if (!map || loading || error) {
      return undefined;
    }
    let active = true;
    const observer = new ResizeObserver(() => {
      if (active) {
        relayout();
      }
    });
    observer.observe(map.getNode());
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [map, loading, error]);
  if (error) {
    return (
      <p role="alert">
        지도를 불러오지 못했습니다. 필요하면 페이지를 새로고침해 주세요. 현재 좌표는 유지됩니다.
      </p>
    );
  }
  if (loading) {
    return <output aria-live="polite">지도를 불러오고 있습니다.</output>;
  }
  return (
    <Map
      onCreate={setMap}
      className={styles.map}
      center={{ lat: center.latitude, lng: center.longitude }}
      level={3}
      draggable={!disabled}
      zoomable={!disabled}
    >
      <MapMarker
        position={{ lat: center.latitude, lng: center.longitude }}
        draggable={!disabled}
        title="세션 위치"
        onDragEnd={(marker) =>
          onMove({
            latitude: marker.getPosition().getLat(),
            longitude: marker.getPosition().getLng(),
          })
        }
      />
    </Map>
  );
}
