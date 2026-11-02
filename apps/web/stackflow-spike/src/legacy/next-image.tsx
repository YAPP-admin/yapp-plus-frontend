// oxlint-disable next/no-img-element
import type { ImgHTMLAttributes } from 'react';

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'loading'> & {
  src: string;
  alt: string;
  priority?: boolean;
  unoptimized?: boolean;
  fill?: boolean;
  quality?: number;
};

export function Image({
  src,
  alt,
  priority,
  fill,
  quality: _quality,
  unoptimized: _unoptimized,
  ...props
}: ImageProps) {
  // Vite 전환 중에는 Next Image 최적화 기능을 사용할 수 없으므로 정적 img로 렌더링합니다.
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      {...props}
      data-fill={fill ?? undefined}
    />
  );
}

// oxlint-disable-next-line import/no-default-export
export default Image;
