import { style } from '@vanilla-extract/css';
import { keyframeTrack, playOnce, reducedMotion } from '@/shared/lib/keyframe-track';

// 피그마 타임라인(222:40229) 2000ms를 한 번 재생합니다. 회전은 SVG에 반영된 기본 각도와의 차이입니다.
// 피그마 스니펫은 반복 재생을 전제로 마지막 동작이 0.9999~1 구간에서 잘려 있어,
// 한 번만 재생하면 끝에서 순간 이동합니다. 잘린 0.9999 키프레임을 빼고 원래 자세로 머무르게 합니다.
const DURATION = '2s';
const TIMES = [0, 0.4, 0.8, 1];

const groupMotion = {
  transformBox: 'fill-box',
  transformOrigin: 'center',
  ...reducedMotion,
} as const;

// 부엉이(Group 899): 숨쉬듯 위로 살짝 늘어났다 돌아옵니다.
const breathe = keyframeTrack(
  TIMES,
  [
    { scale: '1 1', translate: '0 0' },
    { scale: '1 1.012', translate: '0 -1.826px' },
    { scale: '1 1', translate: '0 0' },
    { scale: '1 1', translate: '0 0' },
  ],
  'ease-in-out',
);

// 렌치(Group 900): 기본 각도 -27.545°에서 한 번 흔들립니다.
const wave = keyframeTrack(
  TIMES,
  [
    { rotate: '0deg', translate: '0 0' },
    { rotate: '2.5deg', translate: '1.655px -1.488px' },
    { rotate: '0deg', translate: '0 0' },
    { rotate: '0deg', translate: '0 0' },
  ],
  'ease-in-out',
);

export const body = style({ ...groupMotion, animation: playOnce(DURATION, breathe) });

export const wrench = style({ ...groupMotion, animation: playOnce(DURATION, wave) });
