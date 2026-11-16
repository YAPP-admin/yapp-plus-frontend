/** 네이티브 프로세스 안에서 최신 탭 한 건과 수신 revision을 관리합니다. SDK·인증 연결은 호출자가 맡습니다. */

import type { NotificationOpen } from '@yapp-plus/app-bridge';
import { parsePushTarget, type PushTargetInput } from './push-target';

const recentDeliveryLimit = 128;

/** 같은 발송의 수신과 탭은 별개로 처리하고, 반복 탭은 최근 128건 안에서 한 번만 수락합니다. */
export class PushNotificationState {
  private openSequence = 0;
  private notificationRevision = 0;
  private pendingOpen: NotificationOpen | null = null;
  private readonly receivedDeliveryKeys = new Set<string>();
  private readonly openedDeliveryKeys = new Set<string>();

  /** 웹에 공개할 값만 반환합니다. 본문·발송 식별자는 포함하지 않습니다. */
  getNotificationBridgeState() {
    return { notificationOpen: this.pendingOpen, notificationRevision: this.notificationRevision };
  }

  /** 수신만으로 탐색 대기를 만들지 않습니다. 중복 수신은 갱신 신호를 추가하지 않습니다. */
  recordReceivedPush(input: PushTargetInput): boolean {
    const { deliveryKey } = parsePushTarget(input);
    if (!this.trackDeliveryIfNew(this.receivedDeliveryKeys, deliveryKey)) {
      return false;
    }

    this.notificationRevision += 1;
    return true;
  }

  /** 새로운 탭은 이전 대기를 대체합니다. 식별자가 없으면 콜백마다 새 이벤트로 취급합니다. */
  setPendingNotificationOpen(input: PushTargetInput): boolean {
    const { destination, deliveryKey } = parsePushTarget(input);
    if (!this.trackDeliveryIfNew(this.openedDeliveryKeys, deliveryKey)) {
      return false;
    }

    this.openSequence += 1;
    this.pendingOpen = { eventId: `notification-open-${this.openSequence}`, destination };
    return true;
  }

  /** 현재 대기와 일치하는 처리 확인만 수락합니다. 반복·오래된 확인은 무해합니다. */
  acknowledgeNotificationOpen(eventId: string): void {
    if (this.pendingOpen?.eventId === eventId) {
      this.pendingOpen = null;
    }
  }

  /** 로그아웃·계정 교체에서 대기를 폐기합니다. 늦은 중복 콜백을 막기 위해 최근 ID는 유지합니다. */
  clearPendingNotificationOpen(): void {
    this.pendingOpen = null;
  }

  private trackDeliveryIfNew(recent: Set<string>, key: string | undefined): boolean {
    if (!key) {
      return true;
    }

    if (recent.has(key)) {
      return false;
    }

    recent.add(key);
    if (recent.size > recentDeliveryLimit) {
      const oldest = recent.values().next().value;
      if (oldest !== undefined) {
        recent.delete(oldest);
      }
    }

    return true;
  }
}
