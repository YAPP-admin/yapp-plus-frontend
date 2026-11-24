/** 선택한 사진의 참석 명단을 고르고 최종 확인에서 업로드·접수한다. */
'use client';

import { BackButton } from '@/app/navigation/back-button';
import { Checkbox, HStack, ImageFrame, VStack } from '@seed-design/react';
import { IconCheckmarkLine } from '@karrotmarket/react-monochrome-icon';
import { ActionButton, Text } from '@yapp-plus/ui';
import {
  useTeamAttendance,
  type TeamAttendanceTarget,
  type TeamAttendanceReceipt,
} from '@/features/team-attendance';
import { useTeamAttendancePhotoDraft } from '../model/team-attendance-photo-draft';
import { TabLink } from '@/app/navigation/tab-link';
import { useNativeAuthSession } from '@/features/auth';
import { useScreenActiveContext } from '@/shared/lib/screen-activity';
import {
  checkboxControl,
  checkboxIcon,
  body,
  bottomSection,
  confirmButton,
  container,
  header,
  headerSpacer,
  headerTitle,
  imagePreview,
  meBadge,
  memberCard,
  memberCardChecked,
  memberDescription,
  memberList,
  memberName,
  memberRole,
  memberTitle,
} from './team-attendance-upload-page.css';

type Props = {
  target: TeamAttendanceTarget;
  onSubmitted: (receipt: TeamAttendanceReceipt) => void;
};
type TeamAttendancePhotoProps = { photo: File; previewUrl: string };

/** 비활성 화면과 계정이 바뀐 화면의 선택 초안은 재사용하지 않는다. */
export function TeamAttendanceUploadPage(props: Props) {
  const active = useScreenActiveContext();
  const { phase, session } = useNativeAuthSession();
  const { draft } = useTeamAttendancePhotoDraft();
  return active && draft ? (
    <PhotoForm
      key={`${phase}:${session?.sessionId ?? 'browser'}:${session?.userId}:${props.target.sessionId}`}
      {...props}
      photo={draft.photo}
      previewUrl={draft.previewUrl}
    />
  ) : null;
}

function PhotoForm({ target, photo, previewUrl, onSubmitted }: Props & TeamAttendancePhotoProps) {
  const { apiOptions } = useNativeAuthSession();
  const { form, receipt, error, isPending } = useTeamAttendance(
    target,
    apiOptions,
    photo,
    onSubmitted,
  );
  const isPhotoSubmissionFormDisabled = isPending || !!receipt || error?.kind === 'unknown';

  return (
    <VStack
      as="form"
      className={container}
      aria-label="팀 인증 사진 제출"
      onSubmit={(event) => {
        event.preventDefault();
        if (!isPhotoSubmissionFormDisabled) {
          void form.handleSubmit();
        }
      }}
    >
      <HStack as="header" align="center" justify="space-between" className={header}>
        <BackButton
          fallbackActivityName="Tabs"
          fallbackActivityParams={{ initialTab: 'home' }}
          iconOnly
        />
        <h1 className={headerTitle}>팀 세션 인증</h1>
        <div className={headerSpacer} aria-hidden="true" />
      </HStack>

      <VStack as="main" gap="x5" className={body}>
        <Text as="p">{target.teamName} 팀원과 함께 찍은 사진을 제출해요.</Text>
        <ImageFrame src={previewUrl} alt="선택한 팀 인증 사진" className={imagePreview} />

        {/* 팀원 선택 섹션 */}
        <VStack as="section" gap="x5" aria-label="참석 팀원 선택">
          <VStack gap="x1_5">
            <Text as="h2" className={memberTitle}>
              사진에 나온 팀원을 선택해 주세요
            </Text>
            <Text as="p" className={memberDescription}>
              체크하지 않은 팀원은 운영진이 확인 후 처리해요
            </Text>
          </VStack>

          <VStack gap="x2_5" className={memberList} aria-label="팀원 목록">
            <form.Field name="selectedMembershipIds">
              {(field) =>
                target.members.map((member) => (
                  <Checkbox.Root
                    tone="neutral"
                    checked={field.state.value.includes(member.membershipId)}
                    disabled={
                      isPhotoSubmissionFormDisabled ||
                      member.membershipId === target.selfMembershipId
                    }
                    onCheckedChange={(checked) =>
                      field.handleChange(
                        checked
                          ? [...field.state.value, member.membershipId]
                          : field.state.value.filter((id) => id !== member.membershipId),
                      )
                    }
                    key={member.membershipId}
                    className={`${memberCard} ${field.state.value.includes(member.membershipId) ? memberCardChecked : ''}`}
                  >
                    <Checkbox.HiddenInput />
                    <HStack gap="x2_5" align="center">
                      <Checkbox.Control className={checkboxControl}>
                        <Checkbox.Indicator
                          className={checkboxIcon}
                          checked={<IconCheckmarkLine />}
                        />
                      </Checkbox.Control>
                      <HStack gap="x2" align="center">
                        <Checkbox.Label className={memberName}>{member.name}</Checkbox.Label>
                        <span className={memberRole}>{member.positionLabel}</span>
                      </HStack>
                    </HStack>

                    {member.membershipId === target.selfMembershipId && (
                      <span className={meBadge}>나</span>
                    )}
                  </Checkbox.Root>
                ))
              }
            </form.Field>
          </VStack>
        </VStack>
      </VStack>

      {error && <p role="alert">{error.message}</p>}
      {isPending && <output>인증 사진을 제출하고 있어요.</output>}
      {error?.kind === 'unknown' && (
        <ActionButton asChild>
          <TabLink tab="home">홈으로 돌아가기</TabLink>
        </ActionButton>
      )}
      <VStack as="footer" gap="x2_5" className={bottomSection}>
        <ActionButton
          variant="brandSolid"
          size="large"
          className={confirmButton}
          type="submit"
          disabled={isPhotoSubmissionFormDisabled}
        >
          {isPending ? '제출 중' : '인증 사진 제출하기'}
        </ActionButton>
      </VStack>
    </VStack>
  );
}
