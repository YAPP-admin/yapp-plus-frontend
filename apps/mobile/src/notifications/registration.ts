/** 알림 선택·세션·FCM 토큰을 직렬화해 서버 기기 등록과 로컬 저장을 일치시키는 조율기입니다. */

import Mutex from 'p-mutex';

import type { NotificationApiResult, NotificationApiInput } from './notification-api';
import type { AuthRequestSession } from '../auth/authenticated-request';
import type { NotificationSelection } from './storage';

type NotificationSelectionStore = Readonly<{
  getSelection: (
    firebaseProjectId: string,
    installationId: string,
  ) => Promise<NotificationSelection>;
  setSelection: (
    firebaseProjectId: string,
    installationId: string,
    selection: NotificationSelection,
  ) => Promise<void>;
}>;

export type NotificationRegistrationFailure =
  | 'AUTH_REQUIRED'
  | 'CONFLICT'
  | 'NETWORK'
  | 'SERVER'
  | 'STORAGE'
  | 'PERMISSION_REQUIRED'
  | 'CANCELLED';

export type NotificationRegistrationResult =
  | { ok: true; enabled: boolean }
  | { ok: false; code: NotificationRegistrationFailure };

export type NotificationRegistrationSession = AuthRequestSession;

/** OS 권한은 저장된 앱 선택과 별도로 취급합니다. */
export type NotificationPermission = 'undetermined' | 'blocked' | 'allowed';

/** 권한·토큰은 잠금을 획득한 뒤 조회하며, 호출자가 제공한 세션 경계가 바뀌면 폐기합니다. */
export type NotificationRegistrationInput = Readonly<{
  firebaseProjectId: string;
  installationId: string;
  getToken: () => Promise<string>;
  getPermission: () => Promise<NotificationPermission>;
  requestPermission: () => Promise<NotificationPermission>;
  session: NotificationRegistrationSession;
  /** 늦은 네트워크 응답이 새 계정 선택값을 덮지 않도록 호출자가 세션 경계를 제공합니다. */
  isSessionCurrent: () => boolean;
}>;

export type NotificationRegistrationApi = Readonly<{
  registerDevice: (input: NotificationApiInput) => Promise<NotificationApiResult>;
  removeDevice: (input: NotificationApiInput) => Promise<NotificationApiResult>;
}>;

type RegisteredDevice = Readonly<{
  sessionId: string;
  installationId: string;
  registrationToken: string;
}>;

const toFailure = (result: NotificationApiResult): NotificationRegistrationResult =>
  result.ok ? { ok: true, enabled: true } : { ok: false, code: result.code };

/**
 * 수동 선택과 앱 수명 자동 동기화가 같은 순서로 서버를 갱신하도록 합니다.
 * 인스턴스는 앱 수명 동안 하나만 만들며 FCM 토큰은 메모리 캐시에만 보관합니다.
 */
export class NotificationRegistration {
  private readonly registrationMutex = new Mutex();
  private registered: RegisteredDevice | undefined;

  public constructor(
    private readonly storage: NotificationSelectionStore,
    private readonly api: NotificationRegistrationApi,
  ) {}

  /** 저장된 선택을 읽어 현재 세션의 서버 등록 상태와 맞춥니다. */
  public sync(input: NotificationRegistrationInput): Promise<NotificationRegistrationResult> {
    return this.registrationMutex.withLock(() => this.updateSelection(input));
  }

  /** 서버 반영이 성공한 경우에만 새 선택을 저장합니다. */
  public async setEnabled(
    input: NotificationRegistrationInput,
    enabled: boolean,
  ): Promise<NotificationRegistrationResult> {
    const change = async () => {
      try {
        return await this.registrationMutex.withLock(() => this.updateSelection(input, enabled));
      } catch (error) {
        await this.reconcileSavedSelection(input);
        throw error;
      }
    };

    const result = await change();
    if (!result.ok && result.code !== 'CANCELLED') {
      await this.reconcileSavedSelection(input);
    }

    return result;
  }

  /** 세션 종료·교체 시 이전 등록 성공 기록만 폐기합니다. 서버 해제 요청은 보내지 않습니다. */
  public clearRegistrationCache(): void {
    this.registered = undefined;
  }

  private async reconcileSavedSelection(input: NotificationRegistrationInput): Promise<void> {
    // 변경 작업의 잠금이 풀린 뒤 실행하며, 큐에 있던 새 선택도 다시 읽습니다.
    await this.registrationMutex.withLock(async () => {
      if (!input.isSessionCurrent()) {
        return;
      }

      this.clearRegistrationCache();
      try {
        const result = await this.updateSelection(input);
        if (!result.ok) {
          this.clearRegistrationCache();
        }
      } catch {
        this.clearRegistrationCache();
        // 한 번만 복구합니다. 다음 시도는 앱 복귀·토큰 변경 또는 사용자 행동이 담당합니다.
      }
    });
  }

  /** 자동 동기화와 같은 잠금 안에서 권한만 요청하며 선택·서버 등록은 변경하지 않습니다. */
  public requestPermission(input: NotificationRegistrationInput): Promise<void> {
    return this.registrationMutex.withLock(async () => {
      if (!input.isSessionCurrent()) {
        return;
      }
      const permission = await input.getPermission();
      if (permission === 'undetermined' && input.isSessionCurrent()) {
        await input.requestPermission();
      }
    });
  }

  private async updateSelection(
    input: NotificationRegistrationInput,
    requestedEnabled?: boolean,
  ): Promise<NotificationRegistrationResult> {
    if (!input.isSessionCurrent()) {
      return { ok: false, code: 'CANCELLED' };
    }

    let selection: NotificationSelection;
    try {
      selection = await this.storage.getSelection(input.firebaseProjectId, input.installationId);
    } catch {
      return { ok: false, code: 'STORAGE' };
    }
    const enabled = requestedEnabled ?? selection.enabled;
    const changed = await this.apply(input, enabled, requestedEnabled === true);
    if (!changed.ok || requestedEnabled === undefined) {
      return changed;
    }
    if (!input.isSessionCurrent()) {
      return { ok: false, code: 'CANCELLED' };
    }

    try {
      await this.storage.setSelection(input.firebaseProjectId, input.installationId, { enabled });
    } catch {
      return { ok: false, code: 'STORAGE' };
    }
    return input.isSessionCurrent() ? changed : { ok: false, code: 'CANCELLED' };
  }

  private async apply(
    input: NotificationRegistrationInput,
    enabled: boolean,
    requirePermission = false,
  ): Promise<NotificationRegistrationResult> {
    if (!input.isSessionCurrent()) {
      return { ok: false, code: 'CANCELLED' };
    }
    if (!enabled) {
      return this.removeDevice(input, enabled);
    }

    // 권한 요청도 서버 변경과 같은 잠금 안에서 처리해 중복 다이얼로그를 막습니다.
    const currentPermission = await input.getPermission();
    if (!input.isSessionCurrent()) {
      return { ok: false, code: 'CANCELLED' };
    }
    const shouldRequestPermission = currentPermission === 'undetermined';
    const permission = shouldRequestPermission
      ? await input.requestPermission()
      : currentPermission;
    if (!input.isSessionCurrent()) {
      return { ok: false, code: 'CANCELLED' };
    }

    if (permission !== 'allowed') {
      const removed = await this.removeDevice(input, enabled);
      return removed.ok && requirePermission ? { ok: false, code: 'PERMISSION_REQUIRED' } : removed;
    }
    const registrationToken = await input.getToken();
    if (!input.isSessionCurrent()) {
      return { ok: false, code: 'CANCELLED' };
    }

    const sameRegistration =
      this.registered?.sessionId === input.session.sessionId &&
      this.registered.installationId === input.installationId &&
      this.registered.registrationToken === registrationToken;
    if (sameRegistration) {
      return { ok: true, enabled: true };
    }
    const result = await this.api.registerDevice({
      ...input.session,
      installationId: input.installationId,
      registrationToken,
    });
    if (!input.isSessionCurrent()) {
      return { ok: false, code: 'CANCELLED' };
    }
    if (result.ok) {
      this.registered = {
        sessionId: input.session.sessionId,
        installationId: input.installationId,
        registrationToken,
      };
      return { ok: true, enabled: true };
    }
    return toFailure(result);
  }

  private async removeDevice(
    input: NotificationRegistrationInput,
    enabled: boolean,
  ): Promise<NotificationRegistrationResult> {
    // 응답이 유실돼도 서버는 삭제했을 수 있으므로 이전 등록 성공 기록을 무효화합니다.
    this.registered = undefined;
    const result = await this.api.removeDevice({
      ...input.session,
      installationId: input.installationId,
    });
    if (!input.isSessionCurrent()) {
      return { ok: false, code: 'CANCELLED' };
    }
    return result.ok ? { ok: true, enabled } : toFailure(result);
  }
}
