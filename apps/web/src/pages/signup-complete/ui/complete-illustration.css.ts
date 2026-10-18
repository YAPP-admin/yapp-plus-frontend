import { style } from '@vanilla-extract/css';
import { keyframeTrack, playOnce, reducedMotion, type Ease } from '@/shared/lib/keyframe-track';

// 피그마 타임라인(222:40080) 2000ms. 값은 motion 스니펫 그대로이며, 회전은 SVG에 반영된 기본 각도와의 차이입니다.
const DURATION = '2s';

const groupMotion = {
  transformBox: 'fill-box',
  transformOrigin: 'center',
  ...reducedMotion,
} as const;

// 부엉이(Group 669): 나타나면서 통통 튀다가 멈춥니다.
const OWL_TIMES = [
  0, 0.07, 0.2, 0.34, 0.425, 0.575, 0.715, 0.85, 0.95, 0.9996, 0.9997, 0.9998, 0.9999, 1,
];
const OWL_EASES: readonly Ease[] = [
  'ease-in-out',
  'ease-out',
  'ease-in',
  'ease-in-out',
  'ease-in-out',
  'ease-out',
  'ease-in',
  'ease-in-out',
  'ease-in-out',
  'ease-out',
  'ease-in',
  'ease-in-out',
  'ease-in-out',
];
const OWL_SCALE_X = [1, 1.035, 0.98, 1.04, 1, 1.03, 0.985, 1.035, 1, 1.025, 0.99, 1.025, 1, 1];
const OWL_SCALE_Y = [1, 0.95, 1.025, 0.95, 1, 0.96, 1.02, 0.955, 1, 0.965, 1.015, 0.965, 1, 1];
const OWL_X = [0, -2.257, 1.29, -2.58, 0, -1.935, 0.967, -2.257, 0, -1.612, 0.645, -1.612, 0, 0];
const OWL_Y = [0, 5.961, -9.98, 5.961, 0, 4.769, -7.884, 5.365, 0, 4.172, -5.788, 4.172, 0, 0];

const owlFadeIn = keyframeTrack(
  [0, 0.09, 1],
  [{ opacity: 0 }, { opacity: 1 }, { opacity: 1 }],
  ['ease-out', 'linear'],
);
const owlBounce = keyframeTrack(
  OWL_TIMES,
  OWL_TIMES.map((_, index) => ({
    scale: `${OWL_SCALE_X[index]} ${OWL_SCALE_Y[index]}`,
    translate: `${OWL_X[index]}px ${OWL_Y[index]}px`,
  })),
  OWL_EASES,
);

// 꽃가루(Group 682·681): 아래에서 떠오르며 좌우로 흔들립니다. 오른쪽은 0.1초 늦게 시작합니다.
function confetti(
  opacityTimes: readonly number[],
  rotateTimes: readonly number[],
  rotations: readonly number[],
  yTimes: readonly number[],
) {
  const fadeIn = keyframeTrack(
    opacityTimes,
    [0, 0, 1, 1].map((opacity) => ({ opacity })),
    ['ease-in-out', 'ease-out', 'linear'],
  );
  const sway = keyframeTrack(
    rotateTimes,
    rotations.map((angle) => ({ rotate: `${angle}deg` })),
    ['ease-out', 'ease-in-out', 'ease-in-out', 'ease-in-out'],
  );
  const float = keyframeTrack(
    yTimes,
    [7, 7, -2, 0, -3, 1, 0].map((y) => ({ translate: `0 ${y}px` })),
    ['ease-in-out', 'ease-out', 'ease-in-out', 'ease-in-out', 'ease-in-out', 'ease-in-out'],
  );
  return style({ ...groupMotion, animation: playOnce(DURATION, fadeIn, sway, float) });
}

export const owl = style({ ...groupMotion, animation: playOnce(DURATION, owlFadeIn, owlBounce) });

// 기본 각도 -15.273°
export const confettiLeft = confetti(
  [0, 0.07, 0.19, 1],
  [0, 0.32, 0.65, 0.9999, 1],
  [-3, 2, -1, 1.5, 0],
  [0, 0.07, 0.28, 0.475, 0.8, 0.9999, 1],
);

// 기본 각도 15.682°
export const confettiRight = confetti(
  [0, 0.12, 0.24, 1],
  [0, 0.37, 0.65, 0.9999, 1],
  [3, -2, 1, -1.5, 0],
  [0, 0.12, 0.33, 0.475, 0.8, 0.9999, 1],
);
