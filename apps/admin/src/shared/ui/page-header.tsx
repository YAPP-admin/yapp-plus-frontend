import { HStack, Text, VStack } from '@seed-design/react';
import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description: string;
  eyebrow?: string;
  children?: ReactNode;
};

export function PageHeader({ title, description, eyebrow, children }: PageHeaderProps) {
  return (
    <HStack as="header" justify="space-between" align="flex-end" gap="x4" flexWrap="wrap">
      <VStack gap="x2">
        {eyebrow && (
          <Text as="p" textStyle="t1Bold" color="fg.brand">
            {eyebrow}
          </Text>
        )}
        <Text as="h1" textStyle="t12Bold">
          {title}
        </Text>
        <Text as="p" textStyle="t2Regular" color="fg.neutralMuted">
          {description}
        </Text>
      </VStack>
      {children}
    </HStack>
  );
}
