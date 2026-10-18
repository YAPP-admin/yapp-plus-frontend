import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const backButton = style({ minHeight: '3rem', touchAction: 'manipulation' });

// SEED ghost 버튼은 아이콘 색 변경을 허용합니다. 피그마 chevron 색(fg.neutralMuted)을 따릅니다.
export const iconBackButton = style({
  touchAction: 'manipulation',
  vars: { '--seed-icon-color': vars.$color.fg.neutralMuted },
});
