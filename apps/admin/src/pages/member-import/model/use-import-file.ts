import { useImportFileMutation } from './use-import-file-mutation';

/** 파일 선택과 mutation 상태를 업로드 화면에 필요한 형태로 조합한다. */
export function useImportFile() {
  const {
    data: mutationData,
    error: mutationError,
    isPending,
    isError,
    isSuccess,
    reset: resetMutation,
    mutate,
  } = useImportFileMutation();

  const selectFile = (file: File) => {
    mutate(file);
  };

  const reset = () => {
    resetMutation();
  };

  return {
    data: mutationData ?? null,
    error: mutationError,
    isPending,
    isError,
    isSuccess,
    selectFile,
    reset,
  };
}
