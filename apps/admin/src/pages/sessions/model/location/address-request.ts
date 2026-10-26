/** 주소 검색의 JSON 전송 경계입니다. DTO 해석 없이 ky 응답과 오류를 전달합니다. */
import { jusoClient } from './juso-client';

// 응답 필드 검증과 ViewModel 변환은 호출자가 수행합니다.
// ky 오류에는 승인키가 포함된 URL이 있으므로 화면·로그에 원본 오류를 출력하지 않습니다.
/** 브라우저에서 주소 JSON을 요청합니다. 전송·파싱·취소 오류는 원형 그대로 전파합니다. */
export async function requestAddressJson(
  parameters: Readonly<Record<string, string>>,
  signal?: AbortSignal,
): Promise<unknown> {
  if (import.meta.env.SSR) {
    throw new Error('주소 조회는 브라우저에서만 사용할 수 있습니다.');
  }
  signal?.throwIfAborted();
  const searchParams = new URLSearchParams({ ...parameters, resultType: 'json' });
  searchParams.delete('callback');
  const payload = await jusoClient.get('addrLinkApi.do', { searchParams, signal }).json<unknown>();
  signal?.throwIfAborted();
  return payload;
}
