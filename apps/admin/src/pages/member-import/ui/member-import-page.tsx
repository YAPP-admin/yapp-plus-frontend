import { Link } from '@tanstack/react-router';
import { HStack, Text } from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
import type { Member } from '~/features/member-management';
import { useMemberImportUpload } from '../model/use-member-import-upload';
import { actions, description, page, returnLink, section, title } from './member-import-page.css';
import { MemberImportTemplateButton } from './member-import-template-button';
import { MemberImportUpload } from './member-import-upload';
import { ImportPreview } from './import-preview';

type MemberImportPageProps = {
  members?: readonly Member[];
  currentGeneration?: number;
};

export function MemberImportPage({ members, currentGeneration }: MemberImportPageProps) {
  const upload = useMemberImportUpload();

  return (
    <main className={page}>
      <h1 className={title}>명단 업로드</h1>
      <p className={description}>CSV 명단을 읽고 반영 전에 오류와 중복을 확인할 수 있어요.</p>

      <section className={section} aria-labelledby="member-import-upload-heading">
        <MemberImportUpload
          entries={upload.entries}
          selectedFile={upload.selectedFile}
          errorMessage={upload.errorMessage}
          isPending={upload.isPending}
          acceptFiles={upload.acceptFiles}
          rejectFiles={upload.rejectFiles}
          setEntries={upload.setEntries}
        />

        <ImportPreview
          key={upload.result?.fileName ?? 'empty'}
          result={upload.result}
          members={members}
          currentGeneration={currentGeneration}
        />

        <HStack className={actions} gap="x2" flexWrap="wrap">
          <MemberImportTemplateButton />
          {(upload.result !== null || upload.errorMessage !== undefined) && (
            <ActionButton type="button" variant="ghost" onClick={upload.reset}>
              다시 올리기
            </ActionButton>
          )}
        </HStack>
      </section>

      {!import.meta.env.DEV && (
        <Text as="p" className={description}>
          회원 명단 조회와 중복 판정 API 연결을 준비 중입니다.
        </Text>
      )}

      <Link className={returnLink} to="/members" search={{}}>
        회원 목록으로 돌아가기
      </Link>
    </main>
  );
}
