/** 캐릭터 이미지의 다운로드와 실패 대체 표시를 프로필 데이터 조회와 분리합니다. */
import { Avatar, IdentityPlaceholder, Skeleton } from '@seed-design/react';
import { useState } from 'react';
import { avatarFrame, placeholder } from './my-loading.css';

/** src를 key로 마운트해 이전 이미지의 로딩·실패 상태가 새 캐릭터로 이어지지 않게 합니다. */
export function ProfileAvatar({ src }: { src: string }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  return (
    <Avatar.Root
      size="64"
      className={avatarFrame}
      onLoadingStatusChange={setStatus}
      aria-busy={status === 'loading'}
    >
      <Avatar.Image src={src} alt="프로필" />
      <Avatar.Fallback>
        {status === 'error' ? (
          <IdentityPlaceholder.Root identity="person">
            {/* SEED의 인라인 SVG는 img로 바꿀 수 없어 이미지 역할을 명시합니다. */}
            {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role */}
            <IdentityPlaceholder.Image role="img" aria-label="기본 프로필" />
          </IdentityPlaceholder.Root>
        ) : (
          <Skeleton
            className={placeholder}
            radius="full"
            width="66px"
            height="66px"
            aria-hidden="true"
          />
        )}
      </Avatar.Fallback>
    </Avatar.Root>
  );
}
