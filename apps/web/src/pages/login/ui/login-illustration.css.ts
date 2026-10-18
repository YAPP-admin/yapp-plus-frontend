import { vars } from '@seed-design/css/vars';
import { keyframes, style, type CSSProperties } from '@vanilla-extract/css';

// 피그마 Graphic-point(222:40179) 350x180 좌표계를 컨테이너 폭에 맞춰 비례 축소합니다.
const STAGE_WIDTH = 350;
const STAGE_HEIGHT = 180;
const px = (value: number) => `calc(${value} * 100cqw / ${STAGE_WIDTH})`;

// 피그마 illust_member_home_enabled 프레임: 좌우 반전되어 있고 아래쪽을 잘라 책상 뒤에서 캐릭터가 올라옵니다.
const FRAME_WIDTH = 438.733;
const FRAME_HEIGHT = 100.616;
const FRAME_LEFT = -43.733;
const FRAME_TOP = 40;

// 피그마 타임라인(222:40171) 3200ms. 반복하지 않고 한 번 재생한 뒤 마지막 프레임에 멈춥니다.
const DURATION = '3.2s';

type Ease = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

// motion.dev 스니펫의 times/values/ease 배열을 구간별 easing이 있는 CSS 키프레임으로 옮깁니다.
function track(times: readonly number[], frames: readonly CSSProperties[], eases: readonly Ease[]) {
  return keyframes(
    Object.fromEntries(
      times.map((time, index) => [
        `${Number((time * 100).toFixed(2))}%`,
        { ...frames[index], ...(eases[index] && { animationTimingFunction: eases[index] }) },
      ]),
    ),
  );
}

const playOnce = (...names: string[]) => names.map((name) => `${name} ${DURATION} both`).join(', ');

const riseOpacity = track(
  [0, 0.0625, 1],
  [{ opacity: 0 }, { opacity: 1 }, { opacity: 1 }],
  ['ease-out', 'linear'],
);

const riseY = track(
  [0, 0.1063, 0.1781, 0.2375, 0.3, 0.35, 0.4063, 1],
  [13, -10, 0, -5, 0, -2, 0, 0].map((y) => ({ translate: `0 ${px(y)}` })),
  ['ease-out', 'ease-in', 'ease-out', 'ease-in', 'ease-out', 'ease-in', 'ease-in-out'],
);

const steam = track(
  [0, 0.5, 1],
  [
    { opacity: 0.6, translate: '0 0' },
    { opacity: 1, translate: `0 ${px(-2)}` },
    { opacity: 0.6, translate: '0 0' },
  ],
  ['ease-in-out', 'ease-in-out'],
);

// 별은 투명도와 크기의 구간 시점이 달라 키프레임을 나눕니다. 피그마의 x/y 이동값은 좌상단 기준
// 확대를 중앙 기준으로 보정한 값이므로, 중앙 기준 scale만으로 같은 결과를 냅니다.
const STAR_EASES: readonly Ease[] = [
  'ease-in-out',
  'ease-out',
  'ease-in-out',
  'ease-in-out',
  'ease-in-out',
  'ease-in-out',
];

function starAnimation(opacityTimes: readonly number[], scaleTimes: readonly number[]) {
  const opacity = track(
    opacityTimes,
    [0, 0, 1, 0.7, 1, 1].map((value) => ({ opacity: value })),
    STAR_EASES,
  );
  const scale = track(
    scaleTimes,
    [0.65, 0.65, 1.12, 1, 0.92, 1.06, 1].map((value) => ({ scale: `${value}` })),
    STAR_EASES,
  );
  return playOnce(opacity, scale);
}

const ANIMATIONS = {
  rise: playOnce(riseOpacity, riseY),
  steam: playOnce(steam),
};

const reducedMotion = {
  '@media': { '(prefers-reduced-motion: reduce)': { animation: 'none' } },
} as const;

export const illustration = style({
  position: 'relative',
  width: '100%',
  maxWidth: `${STAGE_WIDTH}px`,
  aspectRatio: `${STAGE_WIDTH} / ${STAGE_HEIGHT}`,
  containerType: 'inline-size',
  overflow: 'hidden',
  userSelect: 'none',
});

export const frame = style({
  position: 'absolute',
  left: px(FRAME_LEFT),
  top: px(FRAME_TOP),
  width: px(FRAME_WIDTH),
  height: px(FRAME_HEIGHT),
  overflow: 'hidden',
  transform: 'scaleX(-1)',
});

type PartSpec = {
  // 피그마 프레임 중심에서 레이어 중심까지의 거리
  dx: number;
  dy: number;
  width: number;
  height: number;
  image?: string;
  // 선 두께 등으로 이미지가 레이어 경계보다 넓은 경우의 inset
  imageInset?: string;
  transform?: string;
  background?: string;
  borderRadius?: number;
  animation?: string;
};

// 피그마 레이어 순서를 그대로 유지합니다. 뒤에 오는 레이어가 위에 그려집니다.
const PART_SPECS: readonly PartSpec[] = [
  { image: 'background', dx: -2.13, dy: 47.37, width: 183.437, height: 183.624 },
  {
    image: 'part-28413',
    dx: -13.6,
    dy: 55.9,
    width: 16.868,
    height: 24.603,
    transform: 'rotate(-4deg) skewX(-0.01deg)',
    animation: ANIMATIONS.rise,
  },
  {
    image: 'part-28414',
    dx: 7.4,
    dy: 55.89,
    width: 16.868,
    height: 24.603,
    transform: 'rotate(176deg) scaleY(-1) skewX(-0.01deg)',
    animation: ANIMATIONS.rise,
  },
  // 피그마 Group(174:28415)의 모션을 두 자식에 같은 타임라인으로 적용합니다.
  {
    image: 'part-28416',
    dx: 17.68,
    dy: -21.97,
    width: 11.503,
    height: 17.606,
    animation: ANIMATIONS.rise,
  },
  {
    image: 'part-28418',
    dx: -20.66,
    dy: -22.22,
    width: 11.503,
    height: 17.606,
    animation: ANIMATIONS.rise,
  },
  {
    image: 'part-28420',
    dx: -1.16,
    dy: 38.89,
    width: 49.951,
    height: 34.386,
    animation: ANIMATIONS.rise,
  },
  {
    image: 'part-28422',
    dx: -1.03,
    dy: 5.25,
    width: 77.596,
    height: 53.417,
    animation: ANIMATIONS.rise,
  },
  {
    image: 'part-28424',
    imageInset: '-7.53% -1.45%',
    dx: -3.62,
    dy: 45.6,
    width: 24.141,
    height: 4.658,
    animation: ANIMATIONS.rise,
  },
  {
    image: 'part-28426',
    imageInset: '3.93% 1.75% 1.75% 3.93%',
    dx: -1.91,
    dy: 4.31,
    width: 10.834,
    height: 10.834,
    transform: 'rotate(45.03deg) skewX(0.06deg)',
    animation: ANIMATIONS.rise,
  },
  {
    image: 'part-28427',
    dx: -1.91,
    dy: 2.91,
    width: 35.974,
    height: 6.183,
    animation: ANIMATIONS.rise,
  },
  {
    image: 'part-28430',
    dx: -23.59,
    dy: 31.76,
    width: 30.571,
    height: 27.657,
    transform: 'rotate(4.49deg) scaleY(-1) skewX(0.01deg)',
    animation: ANIMATIONS.rise,
  },
  {
    image: 'part-28431',
    dx: -29.77,
    dy: 38.15,
    width: 19.265,
    height: 14.254,
    animation: ANIMATIONS.rise,
  },
  {
    image: 'part-28432',
    imageInset: '-11.86% -29.68% -11.86% -29.69%',
    dx: -21.81,
    dy: 36.89,
    width: 3.35,
    height: 8.385,
    animation: ANIMATIONS.rise,
  },
  // 책상
  {
    background: '#ffd55a',
    borderRadius: 7.02,
    dx: -2.99,
    dy: 71.73,
    width: 215.135,
    height: 60.768,
  },
  {
    image: 'part-28434',
    imageInset: '-37.88% -1.91%',
    dx: -17.21,
    dy: 45.46,
    width: 61.146,
    height: 3.088,
  },
  {
    image: 'part-28435',
    dx: 2.38,
    dy: 34.47,
    width: 25.096,
    height: 22.568,
    transform: 'rotate(128.8deg) scaleY(-1) skewX(-0.06deg)',
    animation: ANIMATIONS.rise,
  },
  {
    image: 'part-28437',
    imageInset: '-8.67% -7.18%',
    dx: 0.41,
    dy: 29.01,
    width: 16.289,
    height: 13.496,
    transform: 'rotate(128.8deg) scaleY(-1) skewX(-0.06deg)',
    animation: ANIMATIONS.rise,
  },
  {
    image: 'part-28438',
    imageInset: '-3.88% -2.12% -3.88% -1.22%',
    dx: -26,
    dy: 31.91,
    width: 55.282,
    height: 30.185,
  },
  { image: 'part-28439', dx: -28.25, dy: 32.49, width: 7.539, height: 7.546 },
  // 스탠드 조명
  { background: '#fc9068', dx: -79.19, dy: 27.25, width: 3.35, height: 32.7 },
  {
    background: '#fc9068',
    borderRadius: 14.039,
    dx: -79.19,
    dy: 45.28,
    width: 20.94,
    height: 3.354,
  },
  { image: 'lamp-shade', imageInset: '0 1.9%', dx: -79.19, dy: 5.48, width: 34.86, height: 29.886 },
  // 커피
  { image: 'cup-handle', dx: 64.89, dy: 36.97, width: 11.793, height: 11.793 },
  { image: 'cup-handle-inner', dx: 62.43, dy: 36.97, width: 6.879, height: 11.793 },
  {
    background: vars.$color.bg.layerDefault,
    borderRadius: 2.34,
    dx: 55.55,
    dy: 35.99,
    width: 18.672,
    height: 21.621,
  },
  {
    background: '#75614f',
    borderRadius: 19.889,
    dx: 55.55,
    dy: 27.14,
    width: 14.741,
    height: 1.966,
  },
  {
    image: 'steam',
    imageInset: '6.55% 0 6.71% 4.55%',
    dx: 56.04,
    dy: 16.82,
    width: 5.897,
    height: 12.776,
    animation: ANIMATIONS.steam,
  },
  // 별
  {
    image: 'star-1',
    dx: -97.56,
    dy: -30.1,
    width: 9.992,
    height: 9.991,
    animation: starAnimation(
      [0, 0.0563, 0.1188, 0.5625, 0.7656, 1],
      [0, 0.0563, 0.1438, 0.2063, 0.5625, 0.7656, 1],
    ),
  },
  {
    image: 'star-2',
    dx: -132.66,
    dy: 8.18,
    width: 18.709,
    height: 18.709,
    animation: starAnimation(
      [0, 0.0813, 0.1438, 0.5938, 0.7906, 1],
      [0, 0.0813, 0.1688, 0.2313, 0.5938, 0.7906, 1],
    ),
  },
  {
    image: 'star-3',
    dx: 101.33,
    dy: -25.74,
    width: 18.709,
    height: 18.709,
    animation: starAnimation(
      [0, 0.1063, 0.1688, 0.625, 0.8156, 1],
      [0, 0.1063, 0.1938, 0.2563, 0.625, 0.8156, 1],
    ),
  },
  {
    image: 'star-4',
    dx: 135.26,
    dy: 15.79,
    width: 11.442,
    height: 11.442,
    animation: starAnimation(
      [0, 0.1313, 0.1938, 0.6563, 0.8406, 1],
      [0, 0.1313, 0.2188, 0.2813, 0.6563, 0.8406, 1],
    ),
  },
];

export const parts = PART_SPECS.map((spec) => ({
  className: style({
    position: 'absolute',
    left: px(FRAME_WIDTH / 2 + spec.dx - spec.width / 2),
    top: px(FRAME_HEIGHT / 2 + spec.dy - spec.height / 2),
    width: px(spec.width),
    height: px(spec.height),
    transform: spec.transform,
    background: spec.background,
    borderRadius: spec.borderRadius === undefined ? undefined : px(spec.borderRadius),
    animation: spec.animation,
    ...reducedMotion,
  }),
  imageClassName:
    spec.image &&
    style({
      position: 'absolute',
      inset: spec.imageInset ?? 0,
      backgroundImage: `url(/images/login-owl/${spec.image}.svg)`,
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
    }),
}));
