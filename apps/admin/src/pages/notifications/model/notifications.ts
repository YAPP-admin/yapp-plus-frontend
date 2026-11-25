import { ApiError } from '@yapp-plus/api';
import type { NotificationHistoryItemResponse } from '@yapp-plus/api/generated';
import { zErrorResponse } from '@yapp-plus/api/generated';

export type NotificationHistoryStatus = NotificationHistoryItemResponse['status'];

export type NotificationHistoryItem = {
  id: number;
  content: string;
  targetRole: string;
  position: string;
  status: NotificationHistoryStatus;
  referenceAt: string;
};

export type NotificationStatusTone = 'scheduled' | 'completed' | 'failed';

export function getNotificationStatus(status: NotificationHistoryStatus): {
  label: '예약' | '완료' | '실패';
  tone: NotificationStatusTone;
  canCancel: boolean;
} {
  if (status === 'SCHEDULED') {
    return { label: '예약', tone: 'scheduled', canCancel: true };
  }

  if (status === 'IN_PROGRESS' || status === 'COMPLETED') {
    return { label: '완료', tone: 'completed', canCancel: false };
  }

  return { label: '실패', tone: 'failed', canCancel: false };
}

export function isVisibleNotificationStatus(_status: NotificationHistoryStatus) {
  return true;
}

export function getNotificationRoleLabel(role: string) {
  return (
    {
      ALL_USERS: '전체 회원',
      PLAYER: '활동회원',
      OB_AND_PLAYER: '활동회원 + OB',
      COMPLETED_MEMBER: '수료회원',
    }[role] ?? role
  );
}

export function getNotificationPositionLabel(position: string) {
  return (
    {
      ALL: '전체 직군',
      PM: 'PM',
      DESIGN: 'Design',
      ANDROID: 'Android',
      IOS: 'iOS',
      WEB: 'Web',
      SERVER: 'Server',
      AI_NATIVE: 'AI Native',
      MOBILE: 'Mobile',
    }[position] ?? position
  );
}

export function formatNotificationTarget(role: string, position: string) {
  return `${getNotificationRoleLabel(role)} · ${getNotificationPositionLabel(position)}`;
}

const notificationDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatNotificationDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : notificationDateFormatter.format(date);
}

export function getNotificationErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const body = zErrorResponse.safeParse(error.body);
    if (error.status === 401) {
      return '로그인이 만료되었어요. 다시 로그인해 주세요.';
    }
    if (error.status === 503 || (body.success && body.data.code === 'NOTIFICATION_UNAVAILABLE')) {
      return '알림 서버를 사용할 수 없어요. 잠시 후 다시 시도해 주세요.';
    }
  }

  return '알림 발송 내역을 불러오지 못했어요. 다시 시도해 주세요.';
}

export const notificationPreviewItems: readonly NotificationHistoryItem[] = [
  {
    id: 1001,
    content: '3차 세미나가 내일 오후 2시에 시작돼요. 장소를 다시 확인해 주세요.',
    targetRole: 'PLAYER',
    position: 'ALL',
    status: 'SCHEDULED',
    referenceAt: '2026-11-26T05:00:00.000Z',
  },
  {
    id: 1002,
    content: '팀 매칭 결과가 업데이트됐어요. 내 팀을 확인해 주세요.',
    targetRole: 'PLAYER',
    position: 'PM',
    status: 'COMPLETED',
    referenceAt: '2026-11-24T10:05:00.000Z',
  },
  {
    id: 1003,
    content: '이번 주 세션 출석 안내를 확인해 주세요.',
    targetRole: 'PLAYER',
    position: 'ALL',
    status: 'COMPLETED',
    referenceAt: '2026-11-22T04:55:00.000Z',
  },
  {
    id: 1004,
    content: '29기 만족도 조사에 참여해 주세요.',
    targetRole: 'ALL_USERS',
    position: 'ALL',
    status: 'COMPLETED',
    referenceAt: '2026-11-20T01:00:00.000Z',
  },
  {
    id: 1005,
    content: '제출 마감까지 하루 남았어요. 아직 제출하지 않았다면 확인해 주세요.',
    targetRole: 'PLAYER',
    position: 'ALL',
    status: 'COMPLETED',
    referenceAt: '2026-11-18T09:30:00.000Z',
  },
  {
    id: 1006,
    content: 'YAPP 활동을 시작한 여러분을 환영해요.',
    targetRole: 'PLAYER',
    position: 'ALL',
    status: 'FAILED',
    referenceAt: '2026-11-10T03:00:00.000Z',
  },
];
