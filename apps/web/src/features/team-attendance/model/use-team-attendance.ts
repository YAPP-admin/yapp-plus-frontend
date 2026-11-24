/** 제출 mutation과 소유 폼의 수명을 연결한다. 계정·대상 전환은 폼을 다시 마운트한다. */
import { revalidateLogic, useForm } from '@tanstack/react-form';
import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  createTeamAttendanceFormSchema,
  type SubmissionError,
  type TeamAttendanceTarget,
  type TeamAttendanceFormValues,
} from './submission-input';
import {
  usePhotoSubmission,
  type SubmissionApiOptions,
  type TeamAttendanceReceipt,
} from './use-photo-submission';

/**
 * 호출 화면은 이탈 시 폼을 unmount하고 계정·대상 변경 시 key를 바꿔 초안을 폐기해야 한다.
 * 유효한 접수가 확인되고 화면이 활성일 때만 onSubmitted를 직접 호출한다.
 * 상위 mutation이 체크섬부터 세 HTTP mutation까지의 진행·오류·접수 결과를 소유한다.
 */
export function useTeamAttendance(
  target: TeamAttendanceTarget,
  apiOptions: SubmissionApiOptions,
  photo: File,
  onSubmitted: (receipt: TeamAttendanceReceipt) => void,
) {
  const { submitPhoto } = usePhotoSubmission(apiOptions);
  // 화면 이탈 시 HTTP와 후속 요청을 중단하고 성공·결과 불명 뒤 재전송을 막는다.
  const controllerRef = useRef<AbortController | null>(null);
  const submission = useMutation<
    TeamAttendanceReceipt,
    SubmissionError,
    { request: Promise<TeamAttendanceReceipt>; signal: AbortSignal }
  >({
    retry: false,
    networkMode: 'always',
    gcTime: 0,
    // 사진 파일 대신 onSubmit에서 시작한 제출의 완료만 기다린다.
    mutationFn: async ({ request, signal }) => {
      const receipt = await request;
      signal.throwIfAborted();
      return receipt;
    },
    onError: (error, { signal }) => {
      if (!signal.aborted && error.kind !== 'unknown') {
        controllerRef.current = null;
      }
    },
  });

  useEffect(() => {
    controllerRef.current = null;

    return () => {
      // 폼 검증이 끝나기 전에 이탈해도 늦은 onSubmit이 요청을 시작하지 못하게 한다.
      controllerRef.current ??= new AbortController();
      controllerRef.current.abort();
    };
  }, []);

  const defaultValues: TeamAttendanceFormValues = {
    selectedMembershipIds: [target.selfMembershipId],
  };
  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic({ mode: 'submit', modeAfterSubmission: 'change' }),
    validators: { onDynamic: createTeamAttendanceFormSchema(target) },
    onSubmit: ({ value }) => {
      if (controllerRef.current) {
        return;
      }
      const current = new AbortController();
      controllerRef.current = current;

      const request = submitPhoto(
        { target, photo, selectedMembershipIds: value.selectedMembershipIds },
        current.signal,
      );

      submission.mutate(
        { request, signal: current.signal },
        {
          // 호출별 콜백은 폼이 해제된 뒤 실행하지 않는다.
          onSuccess: (receipt) => onSubmitted(receipt),
        },
      );
    },
  });

  return {
    form,
    receipt: submission.data ?? null,
    isPending: submission.isPending,
    error: submission.error,
  };
}
