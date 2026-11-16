/** Firebase 설치별 알림 수신 선택을 Keychain에 보관하는 저장소 경계입니다. */

import * as SecureStore from 'expo-secure-store';

export type NotificationSelection = Readonly<{ enabled: boolean }>;

export type NotificationSelectionStorage = Pick<
  typeof SecureStore,
  'deleteItemAsync' | 'getItemAsync' | 'setItemAsync'
>;

const storagePrefix = 'org.yapp.yappplus.notifications.selection';

const selectionKey = (projectId: string, installationId: string): string =>
  `${storagePrefix}.${projectId}.${installationId}`;

const parseSelection = (value: string): NotificationSelection | null => {
  try {
    const parsed: unknown = JSON.parse(value);
    return typeof parsed === 'boolean' ? { enabled: parsed } : null;
  } catch {
    // 손상된 값은 아래에서 안전한 OFF로 처리합니다.
  }

  return null;
};

/** Firebase project와 FID 조합의 선택을 읽습니다. 값이 없으면 ON, 손상됐으면 안전한 OFF입니다. */
export const getNotificationSelection = async (
  firebaseProjectId: string,
  installationId: string,
  storage: NotificationSelectionStorage = SecureStore,
): Promise<NotificationSelection> => {
  const key = selectionKey(firebaseProjectId, installationId);
  const value = await storage.getItemAsync(key);
  if (value === null) {
    return { enabled: true };
  }

  const selection = parseSelection(value);
  if (selection) {
    return selection;
  }

  // 삭제하면 다음 동기화에서 기본 ON으로 돌아가므로 손상 상태를 OFF로 복구합니다.
  await storage.setItemAsync(key, JSON.stringify(false));
  return { enabled: false };
};

/** 서버 등록이 성공한 뒤에만 호출해 사용자 선택과 서버 상태를 함께 확정합니다. */
export const setNotificationSelection = (
  firebaseProjectId: string,
  installationId: string,
  selection: NotificationSelection,
  storage: NotificationSelectionStorage = SecureStore,
): Promise<void> =>
  storage.setItemAsync(
    selectionKey(firebaseProjectId, installationId),
    JSON.stringify(selection.enabled),
  );

export const notificationStorage = {
  getSelection: getNotificationSelection,
  setSelection: setNotificationSelection,
};
