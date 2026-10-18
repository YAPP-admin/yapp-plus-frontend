import { keyframes, type CSSProperties } from '@vanilla-extract/css';

// `.css.ts` 파일에서만 호출합니다. vanilla-extract가 호출한 스타일 파일에 키프레임을 등록합니다.

export type Ease = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

// 피그마 motion.dev 스니펫의 times·values·ease 배열을 구간별 easing이 있는 CSS 키프레임으로 옮깁니다.
// ease를 하나만 주면 모든 구간에 같은 easing을 적용합니다.
export function keyframeTrack(
  times: readonly number[],
  frames: readonly CSSProperties[],
  ease: Ease | readonly Ease[],
) {
  return keyframes(
    Object.fromEntries(
      times.map((time, index) => {
        const segmentEase = typeof ease === 'string' ? ease : ease[index];
        const isLast = index === times.length - 1;
        return [
          `${Number((time * 100).toFixed(2))}%`,
          {
            ...frames[index],
            ...(!isLast && segmentEase && { animationTimingFunction: segmentEase }),
          },
        ];
      }),
    ),
  );
}

// 반복하지 않고 한 번 재생한 뒤 마지막 프레임에 멈춥니다.
export function playOnce(duration: string, ...names: string[]) {
  return names.map((name) => `${name} ${duration} both`).join(', ');
}

export const reducedMotion = {
  '@media': { '(prefers-reduced-motion: reduce)': { animation: 'none' } },
} as const;
