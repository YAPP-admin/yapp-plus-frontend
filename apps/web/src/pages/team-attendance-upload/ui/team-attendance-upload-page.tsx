'use client';

import { BackButton } from '@/app/navigation/back-button';
import { IconCameraLine, IconCheckmarkLine } from '@karrotmarket/react-monochrome-icon';
import { ActionButton, Text } from '@yapp-plus/ui';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import {
  body,
  bottomSection,
  changeImageBadge,
  checkboxSquare,
  checkboxSquareChecked,
  confirmButton,
  container,
  fileInputHidden,
  header,
  headerSpacer,
  headerTitle,
  homeIndicatorArea,
  imagePreview,
  meBadge,
  memberCard,
  memberCardChecked,
  memberDescription,
  memberInfoLeft,
  memberList,
  memberName,
  memberRole,
  memberSection,
  memberTextWrap,
  memberTitle,
  srOnly,
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
  { id: '1', name: '강야뿌', role: 'PM', checked: true },
  { id: '2', name: '김야뿌', role: 'Design', isMe: true, checked: true },
  { id: '3', name: '이야뿌', role: 'Android', checked: true },
  { id: '4', name: '최야뿌', role: 'Server', checked: true },
  { id: '5', name: '박야뿌', role: 'iOS', checked: false },
];

export function TeamAttendanceUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 기본적으로 피그마처럼 샘플 사진이 들어가 있거나, 사용자가 직접 올릴 수 있게 지원
  const [photoUrl, setPhotoUrl] = useState<string | null>('/images/my/attendance-empty.svg');
  const [members, setMembers] = useState<TeamMember[]>(DEFAULT_MEMBERS);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
    }
  }

  function toggleMember(id: string) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, checked: !m.checked } : m)));
  }

  function handleSubmit() {
    const isError = searchParams?.get('error') === 'true';
    if (isError) {
      router.push('/team-attendance/error');
    } else {
      router.push('/team-attendance/complete');
    }
  }

  return (
    <div className={container}>
      <header className={header}>
        <BackButton fallback="/" iconOnly />
        <h1 className={headerTitle}>팀 세션 인증</h1>
        <div className={headerSpacer} aria-hidden="true" />
      </header>

      <main className={body}>
        {/* 사진 업로드 영역 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={fileInputHidden}
          onChange={handleFileChange}
        />
        <button
          type="button"
          className={uploadArea}
          onClick={() => fileInputRef.current?.click()}
          aria-label="인증 사진 선택"
        >
          {photoUrl ? (
            <>
              <Image
                src={photoUrl}
                alt="업로드된 팀 인증 사진"
                width={350}
                height={180}
                className={imagePreview}
                unoptimized
              />
              <span className={changeImageBadge}>사진 변경</span>
            </>
          ) : (
            <>
              <div className={uploadIconWrap}>
                <IconCameraLine width={24} height={24} />
              </div>
              <p className={uploadPromptText}>사진 첨부하기</p>
              <p className={uploadHintText}>10MB 이하의 사진만 업로드할 수 있어요</p>
            </>
          )}
        </button>

        {/* 팀원 선택 섹션 */}
        <section className={memberSection} aria-label="참석 팀원 선택">
          <Text as="h2" className={memberTitle}>
            사진에 나온 팀원을 선택해 주세요
          </Text>
          <Text as="p" className={memberDescription}>
            체크하지 않은 팀원은 운영진이 확인 후 처리해요
          </Text>

          <div className={memberList} aria-label="팀원 목록">
            {members.map((member) => (
              <label
                key={member.id}
                className={`${memberCard} ${member.checked ? memberCardChecked : ''}`}
              >
                <input
                  type="checkbox"
                  className={srOnly}
                  checked={member.checked}
                  onChange={() => toggleMember(member.id)}
                />
                <div className={memberInfoLeft}>
                  <div
                    className={`${checkboxSquare} ${member.checked ? checkboxSquareChecked : ''}`}
                    aria-hidden="true"
                  >
                    {member.checked && <IconCheckmarkLine width={14} height={14} />}
                  </div>
                  <div className={memberTextWrap}>
                    <span className={memberName}>{member.name}</span>
                    <span className={memberRole}>{member.role}</span>
                  </div>
                </div>

                {member.isMe && <span className={meBadge}>나</span>}
              </label>
            ))}
          </div>
        </section>
      </main>

      <footer className={bottomSection}>
        <ActionButton
          variant="brandSolid"
          size="large"
          className={confirmButton}
          onClick={handleSubmit}
        >
          확인
        </ActionButton>
        <div className={homeIndicatorArea} aria-hidden="true" />
      </footer>
    </div>
  );
}
