/** 사진 준비와 참석 명단 폼을 연결한다. 대상과 접수 이동은 상위 Activity가 공급한다. */
'use client';

import { BackButton } from '@/app/navigation/back-button';
import { Checkbox, HStack, ImageFrame, VStack } from '@seed-design/react';
import { IconCameraLine, IconCheckmarkLine } from '@karrotmarket/react-monochrome-icon';
import { ActionButton, Text } from '@yapp-plus/ui';
import { useId, useRef, useState } from 'react';
import {
  useTeamAttendance,
  type TeamAttendanceTarget,
  type TeamAttendanceReceipt,
} from '@/features/team-attendance';
import { TabLink } from '@/app/navigation/tab-link';
import { useNativeAuthSession } from '@/features/auth';
import { useScreenActiveContext } from '@/shared/lib/screen-activity';
import fixturePhotoUrl from '../model/photo-fixture.jpg';
import { useAttendancePhoto } from '../model/use-attendance-photo';
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
  fixturePreview,
  meBadge,
  memberCard,
  memberCardChecked,
  memberDescription,
  memberList,
  memberName,
  memberRole,
  memberTitle,
  uploadArea,
  uploadHintText,
  uploadIconWrap,
  uploadPromptText,
} from './team-attendance-upload-page.css';

type Props = {
  target: TeamAttendanceTarget;
  onSubmitted: (receipt: TeamAttendanceReceipt) => void;
};

/** 비활성 화면과 계정이 바뀐 화면의 사진 초안은 재사용하지 않는다. */
export function TeamAttendanceUploadPage(props: Props) {
  const active = useScreenActiveContext();
  const { isNative, phase, session } = useNativeAuthSession();
  return active ? (
    <PhotoForm
      key={`${phase}:${session?.sessionId ?? 'browser'}:${session?.userId}:${props.target.sessionId}`}
      {...props}
      isNative={isNative}
    />
  ) : null;
}

function PhotoForm({ isNative, target, onSubmitted }: Props & { isNative: boolean }) {
  // 화면이 여러 개 쌓여도 각 사진 선택 버튼이 자신의 안내 문구를 참조하게 한다.
  const hintId = useId();
  const photoButtonRef = useRef<HTMLButtonElement>(null);
  const [fixtureError, setFixtureError] = useState(false);
  const showFixture =
    !isNative && import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true';
  const { apiOptions } = useNativeAuthSession();
  const { form, receipt, error, isPending } = useTeamAttendance(target, apiOptions, onSubmitted);
  const photo = useAttendancePhoto(({ blob }) => {
    form.setFieldValue('photo', new File([blob], 'team-attendance.jpg', { type: 'image/jpeg' }));
  });
  const isPhotoSubmissionFormDisabled = isPending || !!receipt || error?.kind === 'unknown';

  const photoTrigger = (
    <ActionButton
      type="button"
      variant="neutralWeak"
      className={uploadArea}
      disabled={photo.isPending || isPhotoSubmissionFormDisabled}
      aria-busy={photo.isPending}
      onClick={() => photo.pick('library')}
      aria-label={photo.photo ? '인증 사진 바꾸기' : '인증 사진 선택'}
      ref={photoButtonRef}
      aria-describedby={`${hintId} ${hintId}-error`}
    >
      {photo.photo ? (
        <ImageFrame
          src={photo.photo.previewUrl}
          alt="선택한 팀 인증 사진"
          className={imagePreview}
        />
      ) : (
        <>
          <div className={uploadIconWrap}>
            <IconCameraLine width={24} height={24} aria-hidden="true" />
          </div>
          <p className={uploadPromptText}>사진 첨부하기</p>
        </>
      )}
    </ActionButton>
  );

  return (
    <VStack
      as="form"
      className={container}
      aria-label="팀 인증 사진 제출"
      onSubmit={(event) => {
        event.preventDefault();
        if (isNative && !isPhotoSubmissionFormDisabled && !photo.isPending) {
          void form.handleSubmit();
          if (!photo.photo) {
            photoButtonRef.current?.focus();
          }
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
        <Text as="p">개발용 팀 정보로 서버에 사진을 제출해요.</Text>
        {isNative && photoTrigger}
        {showFixture && (
          <>
            <ImageFrame
              src={fixturePhotoUrl}
              alt="개발용 JPEG 미리보기"
              className={fixturePreview}
            />
            <ActionButton
              type="button"
              variant="neutralWeak"
              onClick={() => setFixtureError((previous) => !previous)}
            >
              {fixtureError ? '오류 안내 닫기' : '오류 안내 보기'}
            </ActionButton>
          </>
        )}
        <p id={hintId} className={uploadHintText}>
          {isNative
            ? '앨범에서 고르거나 직접 촬영해 주세요.'
            : '브라우저에서는 고정 JPEG로 화면만 확인해요. 사진 선택·변환은 앱에서 확인해 주세요.'}{' '}
          변환한 사진은 10MiB 이하여야 해요.
        </p>
        {isNative && (
          <ActionButton
            type="button"
            variant="neutralWeak"
            disabled={photo.isPending || isPhotoSubmissionFormDisabled}
            onClick={() => photo.pick('camera')}
          >
            사진 촬영하기
          </ActionButton>
        )}
        {photo.isPending && <progress aria-label="사진 준비 중" />}
        <output aria-label="사진 준비 상태">
          {showFixture && fixtureError
            ? '사진을 준비하지 못했어요. 다시 시도해 주세요.'
            : (photo.error ?? (photo.photo ? '사진을 준비했어요. 아직 제출하지 않았어요.' : ''))}
        </output>

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

      <form.Field name="photo">
        {(field) => (
          <output id={`${hintId}-error`} aria-label="사진 입력 오류">
            {field.state.meta.errors.map((issue) => issue?.message).join(' ')}
          </output>
        )}
      </form.Field>
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
          disabled={!isNative || photo.isPending || isPhotoSubmissionFormDisabled}
        >
          {isPending ? '제출 중' : '인증 사진 제출하기'}
        </ActionButton>
      </VStack>
    </VStack>
  );
}
