/** 제출 mutation과 소유 폼의 수명을 연결한다. 계정·대상 전환은 폼을 다시 마운트한다. */
import { revalidateLogic, useForm } from '@tanstack/react-form';
import { useEffect, useRef, useState } from 'react';
import {
  createTeamAttendanceFormSchema,
  SubmissionError,
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
 * 진행 상태는 세 HTTP mutation에서 합산하며 체크섬 계산 중에도 중복 실행은 차단한다.
 */
export function useTeamAttendance(target: TeamAttendanceTarget, apiOptions: SubmissionApiOptions) {
  const { submitPhoto, isPending } = usePhotoSubmission(apiOptions);
  // 화면 이탈 시 HTTP와 후속 요청을 중단하고 성공·결과 불명 뒤 재전송을 막는다.
  const controllerRef = useRef<AbortController | null>(null);
  const [receipt, setReceipt] = useState<TeamAttendanceReceipt | null>(null);
  const [error, setError] = useState<SubmissionError | null>(null);

  useEffect(() => {
    controllerRef.current = null;

    return () => {
      // 폼 검증이 끝나기 전에 이탈해도 늦은 onSubmit이 요청을 시작하지 못하게 한다.
      controllerRef.current ??= new AbortController();
      controllerRef.current.abort();
    };
  }, []);

  const defaultValues: TeamAttendanceFormValues = {
    photo: null,
    selectedMembershipIds: [target.selfMembershipId],
  };
  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic({ mode: 'submit', modeAfterSubmission: 'change' }),
    validators: { onDynamic: createTeamAttendanceFormSchema(target) },
    onSubmit: async ({ value }) => {
      // Standard Schema 검증은 onSubmit의 입력 타입을 좁혀주지 않으므로 null만 확인한다.
      if (controllerRef.current) {
        return;
      }
      if (!value.photo) {
        return;
      }
      const input = {
        target,
        photo: value.photo,
        selectedMembershipIds: value.selectedMembershipIds,
      };

      const current = new AbortController();
      controllerRef.current = current;
      setError(null);

      try {
        const result = await submitPhoto(input, current.signal);
        if (!current.signal.aborted) {
          setReceipt(result);
        }
      } catch (caughtError) {
        if (current.signal.aborted) {
          return;
        }
        const failure =
          caughtError instanceof SubmissionError
            ? caughtError
            : new SubmissionError('failed', '사진을 제출하지 못했어요. 다시 시도해 주세요.');
        setError(failure);
        if (failure.kind !== 'unknown') {
          controllerRef.current = null;
        }
      }
    },
  });

  return { form, receipt, isPending, error };
}
