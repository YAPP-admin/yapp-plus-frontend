/** 공지 전용 묶음 제한과 이미지 읽기 실패 처리만 검증한다. */
import { afterEach, expect, it, vi } from 'vitest';
import type { AttachmentInputFileEntry } from '@seed-design/react';
import {
  getNoticeAttachmentCountError,
  validateNoticeAttachmentImages,
} from './notice-attachments';

afterEach(() => vi.unstubAllGlobals());

/** 이미지 읽기 결과를 구분할 파일을 만든다. 실제 디코딩은 브라우저에서 확인한다. */
function file(name: string) {
  return new File(['image'], name, { type: 'image/png' });
}

it('5개까지 허용하고 6개 선택은 묶음 전체를 거절하도록 안내한다', () => {
  expect(getNoticeAttachmentCountError(0, 5)).toBeNull();
  expect(getNoticeAttachmentCountError(0, 6)).toContain('5개 더 선택');
});

it('기존 4개가 있으면 신규 2개 묶음을 거절하고 남은 개수를 안내한다', () => {
  expect(getNoticeAttachmentCountError(4, 2)).toContain('1개 더 선택');
});

it('SEED 검증 후 읽기 실패만 제외하고 선택 순서와 파일별 오류를 보존한다', async () => {
  const close = vi.fn<() => void>();
  const damaged = file('손상.png');
  const entries: AttachmentInputFileEntry[] = [file('첫째.png'), damaged, file('셋째.png')].map(
    (image) => ({
      id: image.name,
      file: image,
      status: 'pending',
    }),
  );
  const decode = vi
    .fn<(image: File) => Promise<Pick<ImageBitmap, 'close'>>>()
    .mockImplementation((image) => {
      if (image.name === '손상.png') {
        return Promise.reject(new Error('이미지를 읽을 수 없음'));
      }

      return Promise.resolve({ close });
    });
  vi.stubGlobal('createImageBitmap', decode);

  const result = await validateNoticeAttachmentImages(entries);

  expect(result.accepted).toEqual([entries[0], entries[2]]);
  expect(result.rejected).toEqual([{ file: damaged, errors: ['IMAGE_DECODE_FAILED'] }]);
  expect(close).toHaveBeenCalledTimes(2);
});
