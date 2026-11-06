import { ActionButton, Text } from '@yapp-plus/ui';
import { VStack } from '@seed-design/react';
import { useNativeAuthSession } from '../model/session';

/** 인증 여부를 확인할 수 없을 때 보호 내용을 대신하는 복구 안내입니다. */
export function NativeSessionRecovery() {
  const { unsupported, canRetry, isRecovering, retry } = useNativeAuthSession();
  return (
    <VStack as="main" gap="x4" p="x6" align="center" justify="center" minHeight="100dvh">
      <Text as="h1" textStyle="t7Bold">
        {unsupported ? '앱 업데이트가 필요해요' : '로그인 상태를 확인하지 못했어요'}
      </Text>
      <output aria-live="polite">
        <Text textStyle="t4Regular">
          {unsupported
            ? '최신 버전의 YAPP+ 앱에서 다시 이용해 주세요.'
            : '앱 연결을 확인하고 있어요. 잠시 후 다시 시도해 주세요.'}
        </Text>
      </output>
      {canRetry && (
        <ActionButton size="large" disabled={isRecovering} onClick={retry}>
          {isRecovering ? '확인 중…' : '다시 시도'}
        </ActionButton>
      )}
    </VStack>
  );
}
