import type { ImgHTMLAttributes } from 'react';

// Vite에서는 이미지 최적화 서버를 사용하지 않으므로 정적 img로 렌더링합니다.
export function Image({
  alt,
  fill,
  priority: _priority,
  unoptimized: _unoptimized,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean;
  priority?: boolean;
  unoptimized?: boolean;
}) {
  const style = fill ? { ...props.style, width: '100%', height: '100%' } : props.style;
  return <img {...props} alt={alt} style={style} />;
}
