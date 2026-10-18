/** SEED 공식 ResultSection 스니펫을 기반으로 결과 안내와 후속 동작을 배치합니다.
 * @see https://seed-design.io/react/components/result-section
 */
import { ActionButton, Text, VStack } from '@seed-design/react';
import type { ComponentProps, ReactNode } from 'react';

type ResultSectionProps = {
  asset?: ReactNode;
  title: string;
  description: string;
  primaryActionProps?: ComponentProps<typeof ActionButton>;
};

export function ResultSection({
  asset,
  title,
  description,
  primaryActionProps,
}: ResultSectionProps) {
  return (
    <VStack justify="center" align="center" px="x6" py="x4" gap="x4" grow>
      {asset}
      <VStack gap="x2" pb="x6">
        <Text as="h2" align="center" color="fg.neutral" textStyle="t5Bold">
          {title}
        </Text>
        <Text as="p" align="center" color="fg.neutralMuted" textStyle="t4Regular">
          {description}
        </Text>
      </VStack>
      {primaryActionProps && (
        <ActionButton variant="neutralWeak" size="medium" {...primaryActionProps} />
      )}
    </VStack>
  );
}
