/** 개발용 사진 입력·미리보기를 제공한다. 제출 API 연결은 후속 단계에서 수행한다. */
'use client';

import { BackButton } from '@/app/navigation/back-button';
import { Checkbox, HStack, ImageFrame, VStack } from '@seed-design/react';
import { IconCameraLine, IconCheckmarkLine } from '@karrotmarket/react-monochrome-icon';
import { ActionButton, Text } from '@yapp-plus/ui';
import { useId, useState } from 'react';
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

type TeamMember = {
  id: string;
  name: string;
  role: string;
  isMe?: boolean;
  checked: boolean;
};

const DEFAULT_MEMBERS: TeamMember[] = [
  { id: '1', name: '강야뿌', role: 'PM', checked: false },
  { id: '2', name: '김야뿌', role: 'Design', isMe: true, checked: true },
  { id: '3', name: '이야뿌', role: 'Android', checked: true },
  { id: '4', name: '박야뿌', role: 'iOS', checked: true },
  { id: '5', name: '최야뿌', role: 'Server', checked: true },
];

/** 비활성 화면과 계정이 바뀐 화면의 사진 초안은 재사용하지 않는다. */
export function TeamAttendanceUploadPage() {
  const active = useScreenActiveContext();
  const { isNative, phase, session } = useNativeAuthSession();
  return active ? (
    <PhotoForm key={`${phase}:${session?.userId ?? 'browser'}`} isNative={isNative} />
  ) : null;
}

function PhotoForm({ isNative }: { isNative: boolean }) {
  // 화면이 여러 개 쌓여도 각 사진 선택 버튼이 자신의 안내 문구를 참조하게 한다.
  const hintId = useId();
  const [fixtureError, setFixtureError] = useState(false);
  const showFixture =
    !isNative && import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true';
  const photo = useAttendancePhoto();
  const [members, setMembers] = useState<TeamMember[]>(DEFAULT_MEMBERS);

  function toggleMember(id: string) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, checked: !m.checked } : m)));
  }

  const photoTrigger = (
    <ActionButton
      type="button"
      variant="neutralWeak"
      className={uploadArea}
      disabled={photo.isPending}
      aria-busy={photo.isPending}
      onClick={() => photo.pick('library')}
      aria-label={photo.photo ? '인증 사진 바꾸기' : '인증 사진 선택'}
      aria-describedby={hintId}
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
    <VStack className={container}>
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
        <Text as="p">개발용 사진 준비 화면이에요. 아직 인증을 제출하지 않아요.</Text>
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
            disabled={photo.isPending}
            onClick={() => photo.pick('camera')}
          >
            사진 촬영하기
          </ActionButton>
        )}
        {photo.isPending && <progress aria-label="사진 준비 중" />}
        <output>
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
            {members.map((member) => (
              <Checkbox.Root
                tone="neutral"
                checked={member.checked}
                onCheckedChange={() => toggleMember(member.id)}
                key={member.id}
                className={`${memberCard} ${member.checked ? memberCardChecked : ''}`}
              >
                <Checkbox.HiddenInput />
                <HStack gap="x2_5" align="center">
                  <Checkbox.Control className={checkboxControl}>
                    <Checkbox.Indicator className={checkboxIcon} checked={<IconCheckmarkLine />} />
                  </Checkbox.Control>
                  <HStack gap="x2" align="center">
                    <Checkbox.Label className={memberName}>{member.name}</Checkbox.Label>
                    <span className={memberRole}>{member.role}</span>
                  </HStack>
                </HStack>

                {member.isMe && <span className={meBadge}>나</span>}
              </Checkbox.Root>
            ))}
          </VStack>
        </VStack>
      </VStack>

      <VStack as="footer" gap="x2_5" className={bottomSection}>
        <ActionButton
          variant="brandSolid"
          size="large"
          className={confirmButton}
          type="button"
          disabled
        >
          제출 기능 준비 중
        </ActionButton>
      </VStack>
    </VStack>
  );
}
