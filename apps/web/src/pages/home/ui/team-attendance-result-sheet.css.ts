/** 홈 결과 시트의 레이아웃만 소유하며 공용 BottomSheet의 포커스·닫기 동작을 유지합니다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';
import { sheetContent } from './home-page.css';

/** 하단 safe-area 바깥에 떠 있는 결과 시트의 외곽입니다. */
export const content = style([
  sheetContent,
  {
    borderRadius: `${vars.$radius.r4} !important`,
    marginInline: vars.$dimension.x2_5,
    marginBottom: 'max(var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)), 10px)',
    maxHeight:
      'calc(90dvh - max(var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)), 10px))',
    selectors: { '&::after': { display: 'none' } },
  },
]);
/** 드래그 표시와 본문 사이에 디자인의 14px 여백을 유지합니다. */
export const handle = style({
  display: 'flex',
  justifyContent: 'center',
  padding: `${vars.$dimension.x3_5} ${vars.$dimension.x2_5}`,
  flexShrink: 0,
});
/** 제목·사유·그래픽만 스크롤하고 하단 행동은 계속 접근할 수 있게 합니다. */
export const body = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.$dimension.x5,
  padding: `0 ${vars.$dimension.x4_5} ${vars.$dimension.x5}`,
  overflowY: 'auto',
  overscrollBehavior: 'contain',
  minHeight: 0,
  wordBreak: 'keep-all',
  overflowWrap: 'anywhere',
});
/** 제목과 설명의 간격이며 세션 정보는 필요한 경우에만 함께 표시합니다. */
export const heading = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.$dimension.x1_5,
});
/** 반려 사유의 강조 영역입니다. 아이콘과 긴 텍스트의 줄바꿈을 분리합니다. */
export const reason = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.$dimension.x2_5,
  padding: `${vars.$dimension.x3} ${vars.$dimension.x3_5}`,
  borderRadius: vars.$radius.r2,
  background: vars.$color.bg.criticalWeak,
  color: vars.$color.fg.critical,
});
/** 서버 사유의 개행을 보존하며 내용이 길어도 영역 밖으로 넘치지 않습니다. */
export const reasonText = style({
  margin: 0,
  whiteSpace: 'pre-wrap',
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.medium,
});
/** 반려 사유 아이콘의 고유 22px 크기를 보존합니다. */
export const notice = style({ flexShrink: 0 });
/** 공용 완료 일러스트를 Figma의 315×162 비율로 배치하고 좁은 화면에서는 함께 축소합니다. */
export const illustration = style({
  display: 'block',
  width: '100%',
  maxWidth: 315,
  height: 'auto',
  marginInline: 'auto',
  flexShrink: 0,
});
/** 여러 버튼을 디자인 순서로 쌓으며 safe-area는 시트 외곽에서 한 번 처리합니다. */
export const actions = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.$dimension.x2_5,
  padding: `0 ${vars.$dimension.x4_5} ${vars.$dimension.x4_5}`,
  flexShrink: 0,
});
/** 확대된 글자도 버튼을 벗어나지 않도록 최소 높이만 지정합니다. */
export const button = style({
  width: '100%',
  minHeight: 52,
  height: 'auto',
  borderRadius: `${vars.$radius.r3} !important`,
  fontSize: `${vars.$fontSize.t6} !important`,
  fontWeight: `${vars.$fontWeight.bold} !important`,
  whiteSpace: 'normal',
});
