/** 사진 준비의 진행 상태는 mutation, 사진 바이트는 화면 상태로만 소유한다. */
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { pickAttendancePhoto } from '@yapp-plus/app-bridge/web';
import type { AttendancePhotoFailure } from '@yapp-plus/app-bridge';
import { fromNativePhoto } from './photo-blob';

function failureMessage(failure: AttendancePhotoFailure): string {
  switch (failure.code) {
    case 'PERMISSION_DENIED':
      return failure.canAskAgain
        ? '촬영하려면 카메라 접근을 허용해 주세요.'
        : '기기 설정에서 카메라 접근을 허용한 뒤 다시 시도해 주세요.';
    case 'BUSY':
      return '이전 사진 작업을 마친 뒤 다시 시도해 주세요.';
    case 'TOO_LARGE':
      return '변환한 사진이 10MiB를 넘어요. 다른 사진을 선택해 주세요.';
    case 'INVALID_IMAGE':
      return '사진을 읽을 수 없어요. 다른 사진을 선택해 주세요.';
    case 'INVALID_INPUT':
    case 'PROCESSING_FAILED':
      break;
  }
  return '사진을 준비하지 못했어요. 다시 시도해 주세요.';
}

/** 소유 화면이 이탈·계정 변경으로 unmount되면 늦은 응답을 버린다. 취소·실패는 기존 사진을 유지하며 성공한 사진만 onPrepared로 전달한다. */
export function useAttendancePhoto(onPrepared: (photo: File) => Promise<void> | void) {
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const mutation = useMutation({
    retry: false,
    networkMode: 'always',
    gcTime: 0,
    // 파일·Base64가 mutation의 variables/data에 남지 않도록 source만 전달하고 void를 반환한다.
    mutationFn: async (source: 'library' | 'camera'): Promise<void> => {
      const result = await pickAttendancePhoto({ source });
      if (result.status === 'CANCELLED') {
        return;
      }
      if (result.status === 'ERROR') {
        throw new Error(failureMessage(result));
      }
      try {
        if (!mounted.current) {
          return;
        }
        const next = fromNativePhoto(result.photo);
        await onPrepared(new File([next.blob], 'team-attendance.jpg', { type: 'image/jpeg' }));
      } catch {
        // 원문 예외의 사진 데이터·경로가 mutation cache에 보관되지 않도록 cause도 넘기지 않는다.
        throw new Error('사진을 준비하지 못했어요. 다시 시도해 주세요.');
      }
    },
  });
  return {
    isPending: mutation.isPending,
    error: mutation.error?.message ?? null,
    pick: mutation.mutate,
  };
}
