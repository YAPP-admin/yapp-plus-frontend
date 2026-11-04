import { createLinkComponent } from '@stackflow/link';
import type { activityComponents } from '../../../stackflow/src/stack';

/** 일반 Activity 이동을 URL과 Stackflow history에 함께 반영하는 공식 Link입니다. */
export const { Link: ActivityLink } = createLinkComponent<typeof activityComponents>();
