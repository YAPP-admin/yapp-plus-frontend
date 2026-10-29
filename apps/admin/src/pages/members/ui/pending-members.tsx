import { Box, HStack, Text, VStack } from '@seed-design/react';
import { UserRound } from 'lucide-react';
import { ResultSection } from '@yapp-plus/ui';
import { PageHeader } from '~/shared/ui/page-header';

export function PendingMembers() {
  return (
    <VStack
      as="main"
      maxWidth="75rem"
      width="full"
      mx="auto"
      px={{ base: 'x5', md: 'x10' }}
      py="x12"
      gap="x8"
    >
      <PageHeader
        eyebrow="MEMBER MANAGEMENT"
        title="회원 관리"
        description="YAPP 회원 정보와 가입 신청을 관리해요."
      />
      <VStack as="section" aria-labelledby="pending-heading" gap="x3_5">
        <HStack as="header" justify="space-between" align="flex-end" gap="x4">
          <VStack gap="x1_5">
            <Text as="h2" id="pending-heading" textStyle="t5Bold">
              가입 대기
            </Text>
            <Text as="p" textStyle="t1Regular" color="fg.neutralMuted">
              회원 정보를 확인한 뒤 가입을 승인하거나 거절해 주세요.
            </Text>
          </VStack>
          <Text textStyle="t1Regular" color="fg.neutralMuted">
            총 <strong>0</strong>건
          </Text>
        </HStack>
        <VStack
          minHeight="430px"
          justify="center"
          p="x5"
          borderRadius="r3"
          borderWidth={1}
          borderColor="stroke.neutralMuted"
          bg="bg.layerFloating"
        >
          <ResultSection
            size="medium"
            asset={
              <Box aria-hidden="true" color="fg.neutralMuted" pb="x4">
                <UserRound size={40} />
              </Box>
            }
            titleAs="h3"
            title="가입 대기 중인 회원이 없어요"
            description="새로운 가입 신청이 들어오면 이곳에서 확인할 수 있어요."
          />
        </VStack>
      </VStack>
    </VStack>
  );
}
