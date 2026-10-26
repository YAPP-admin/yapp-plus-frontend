/** 원본 오류나 승인키를 노출하지 않는 주소 검색 안내를 만듭니다. */
import { isTimeoutError } from 'ky';

const KEYWORD_ERROR_CODES = [
  'E0005',
  'E0006',
  'E0008',
  'E0009',
  'E0010',
  'E0011',
  'E0012',
  'E0013',
];

export function getAddressSearchError(error: unknown, serviceCode?: string) {
  if (error) {
    return {
      message: isTimeoutError(error)
        ? '주소 검색 시간이 초과되었습니다. 다시 시도해 주세요.'
        : '주소 검색에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      retry: true,
    };
  }
  if (serviceCode) {
    const refine = KEYWORD_ERROR_CODES.includes(serviceCode);
    return {
      message: refine
        ? '검색어를 확인하고 도로명과 건물번호를 구체적으로 입력해 주세요.'
        : '주소 검색을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      retry: !refine,
    };
  }
  return null;
}
