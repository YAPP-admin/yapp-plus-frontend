import { frame, illustration, parts } from './login-illustration.css';

// 피그마 Graphic-point(222:40179)의 레이어와 모션을 CSS로 재현합니다.
export function LoginIllustration() {
  return (
    // 여러 조각을 겹쳐 움직이므로 자식을 가질 수 없는 <img> 대신 role="img"로 하나의 그림을 표현합니다.
    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
    <div className={illustration} role="img" aria-label="노트북으로 작업 중인 부엉이 캐릭터">
      <div className={frame}>
        {parts.map((part) => (
          <span key={part.className} className={part.className}>
            {part.imageClassName && <span className={part.imageClassName} />}
          </span>
        ))}
      </div>
    </div>
  );
}
