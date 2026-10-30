import { useMutation } from '@tanstack/react-query';
import { parseMemberImportFile } from './import-file';

/** 서버 상태로 캐시하지 않는 로컬 파일 파싱 mutation을 제공한다. */
export function useImportFileMutation() {
  return useMutation({
    mutationFn: parseMemberImportFile,
    networkMode: 'always',
    retry: false,
  });
}
