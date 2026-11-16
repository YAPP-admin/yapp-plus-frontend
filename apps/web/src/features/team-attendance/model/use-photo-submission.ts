/** 생성 mutation options로 API를 호출하고, 인증 설정과 분리한 PUT으로 JPEG를 업로드한다. */
import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';
import ky from 'ky';
import { ApiError } from '@yapp-plus/api';
import {
  presignMutation,
  submitMutation,
  zTeamPhotoSubmitted,
  type CreateClientConfig,
  type TeamPhotoUploadUrl,
} from '@yapp-plus/api/generated';
import { SubmissionError, type SubmissionInput, type TeamMember } from './submission-input';

/** 인증 Provider가 제공하는 SDK 설정. PUT에는 전달하지 않는다. */
export type SubmissionApiOptions = ReturnType<CreateClientConfig>;
/** 서버 접수 확인과 제출 당시 명단이다. 운영진의 출석 승인을 의미하지 않는다. */
export type TeamAttendanceReceipt = {
  photoId: number;
  submittedAt: string;
  status: 'PENDING';
  teamName: string;
  members: TeamMember[];
};
const TEAM_PHOTO_ERROR_MESSAGE_BY_HTTP_STATUS: Record<number, string> = {
  400: '사진과 참석 팀원을 다시 확인해 주세요.',
  401: '로그인 상태를 확인한 뒤 다시 시도해 주세요.',
  403: '이 팀 세션에 사진을 제출할 수 없어요.',
  404: '제출할 팀 세션을 찾을 수 없어요.',
  409: '지금은 사진을 제출할 수 없어요. 세션 상태를 확인해 주세요.',
};
const createSubmissionFailedError = (status?: number) =>
  new SubmissionError(
    'failed',
    TEAM_PHOTO_ERROR_MESSAGE_BY_HTTP_STATUS[status ?? 0] ??
      '사진을 제출하지 못했어요. 다시 시도해 주세요.',
  );
const createSubmissionUncertainError = () =>
  new SubmissionError(
    'unknown',
    '접수 여부를 확인하지 못했어요. 다시 제출하지 말고 홈으로 돌아가 주세요.',
  );

/** 세 mutation을 순서대로 실행한다. 사진 바이트는 mutation 변수·결과에 저장하지 않는다. */
export function usePhotoSubmission(apiOptions: SubmissionApiOptions) {
  const uploadRequest = useRef<{
    photo: File;
    destination: TeamPhotoUploadUrl;
    signal: AbortSignal;
  } | null>(null);
  const presign = useMutation({
    ...presignMutation({ ...apiOptions, retry: 0 }),
    retry: false,
    networkMode: 'always',
    gcTime: 0,
  });
  const upload = useMutation({
    retry: false,
    networkMode: 'always',
    gcTime: 0,
    mutationFn: async () => {
      const request = uploadRequest.current;
      uploadRequest.current = null;

      if (!request) {
        throw createSubmissionFailedError();
      }
      const { photo, destination, signal } = request;
      signal.throwIfAborted();

      await ky.put(destination.uploadUrl, {
        body: photo,
        headers: destination.signedHeaders,
        signal,
        timeout: 30_000,
        retry: 0,
        credentials: 'omit',
        redirect: 'error',
        referrerPolicy: 'no-referrer',
      });
    },
  });
  const submit = useMutation({
    ...submitMutation({
      ...apiOptions,
      retry: 0,
      kyOptions: {
        ...apiOptions.kyOptions,
        hooks: {
          ...apiOptions.kyOptions?.hooks,
          afterResponse: [
            ...(apiOptions.kyOptions?.hooks?.afterResponse ?? []),
            ({ response }) => {
              // HTTP 실패는 공통 ApiError로 처리하고, 성공 응답의 접수 상태만 확인한다.
              if (response.ok && response.status !== 201) {
                throw createSubmissionUncertainError();
              }
            },
          ],
        },
      },
    }),
    retry: false,
    networkMode: 'always',
    gcTime: 0,
  });

  async function submitPhoto(
    input: SubmissionInput,
    signal: AbortSignal,
  ): Promise<TeamAttendanceReceipt> {
    if (!navigator.onLine) {
      throw new SubmissionError('offline', '인터넷 연결을 확인해 주세요.');
    }

    let imageKey: string;

    try {
      signal.throwIfAborted();
      const digest = await crypto.subtle.digest('SHA-256', await input.photo.arrayBuffer());
      signal.throwIfAborted();

      const destination = await presign.mutateAsync({
        signal,
        path: { sessionId: input.target.sessionId },
        body: {
          filename: 'team-attendance.jpg',
          contentType: 'image/jpeg',
          sizeBytes: input.photo.size,
          checksumSha256: btoa(String.fromCharCode(...new Uint8Array(digest))),
        },
      });
      imageKey = destination.imageKey;
      uploadRequest.current = { photo: input.photo, destination, signal };
      await upload.mutateAsync();
      signal.throwIfAborted();
    } catch {
      uploadRequest.current = null;
      presign.reset();
      upload.reset();
      throw createSubmissionFailedError();
    }

    try {
      const submitted = await submit.mutateAsync({
        signal,
        path: { sessionId: input.target.sessionId },
        body: { imageKey, selectedMembershipIds: input.selectedMembershipIds },
      });
      const receipt = zTeamPhotoSubmitted.parse(submitted);
      const photoId = Number(receipt.photoId);
      if (!Number.isSafeInteger(photoId) || photoId <= 0 || receipt.status !== 'PENDING') {
        throw createSubmissionUncertainError();
      }

      return {
        photoId,
        submittedAt: receipt.submittedAt,
        status: 'PENDING',
        teamName: input.target.teamName,
        members: input.target.members.filter((member) =>
          input.selectedMembershipIds.includes(member.membershipId),
        ),
      };
    } catch (error) {
      // 최종 POST 이후의 응답 유실은 서버 미접수를 뜻하지 않는다.
      if (error instanceof ApiError && TEAM_PHOTO_ERROR_MESSAGE_BY_HTTP_STATUS[error.status]) {
        throw createSubmissionFailedError(error.status);
      }

      throw error instanceof SubmissionError ? error : createSubmissionUncertainError();
    } finally {
      presign.reset();
      upload.reset();
      submit.reset();
    }
  }

  return { submitPhoto };
}
