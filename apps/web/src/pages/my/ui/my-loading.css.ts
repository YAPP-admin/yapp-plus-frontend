/** 마이페이지 이미지의 크기를 유지하고 공통 모션 감소 스타일을 조합합니다. */
import { style } from '@vanilla-extract/css';

import { skeletonPlaceholder } from '@/shared/ui/skeleton.css';

export const placeholder = skeletonPlaceholder;

export const avatarFrame = style({ width: 66, height: 66, flexShrink: 0 });

export const avatarPlaceholder = style([placeholder, { flexShrink: 0 }]);
