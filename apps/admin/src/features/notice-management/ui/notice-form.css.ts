/** 입력의 외형과 상태는 SEED에 맡기고 폼 배치만 정의한다. */
import { style } from '@vanilla-extract/css';

export const form = style({ display: 'grid', gap: 24, minWidth: 0 });
export const group = style({ border: 0, padding: 0, margin: 0, minWidth: 0 });
export const choices = style({ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 12 });
