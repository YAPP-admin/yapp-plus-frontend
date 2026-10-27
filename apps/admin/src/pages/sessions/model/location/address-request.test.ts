/** 실제 ky 인스턴스의 취소·시간 제한·오류 전파 계약을 네트워크 없이 검증합니다. */
import { HTTPError, NetworkError, TimeoutError } from 'ky';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { requestAddressJson } from './address-request';

const parameters = {
  confmKey: 'test-key=',
  keyword: '테헤란로',
  currentPage: '1',
  countPerPage: '10',
};
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubEnv('SSR', false);
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

/** fetch가 취소될 때까지 대기하는 네트워크 모형입니다. */
function waitForAbort(_input: Parameters<typeof fetch>[0], init?: RequestInit): Promise<Response> {
  return new Promise((_resolve, reject) => {
    (init?.signal ?? (_input instanceof Request ? _input.signal : undefined))?.addEventListener(
      'abort',
      () => reject(new DOMException('취소', 'AbortError')),
      {
        once: true,
      },
    );
  });
}

describe('주소 JSON 전송', () => {
  it('JSON 응답을 전달한다', async () => {
    const payload = { results: { common: { errorCode: '0' }, juso: [] } };
    fetchMock.mockResolvedValue(Response.json(payload));
    const controller = new AbortController();

    await expect(requestAddressJson(parameters, controller.signal)).resolves.toEqual(payload);
  });

  it('고정 JSON endpoint에 인코딩하며 JSONP 콜백과 인증 쿠키를 보내지 않는다', async () => {
    fetchMock.mockResolvedValue(Response.json({}));
    await requestAddressJson({
      ...parameters,
      keyword: '서울 & 길',
      resultType: 'xml',
      callback: 'override',
    });
    const call = fetchMock.mock.calls[0];
    if (!call || !(call[0] instanceof Request)) {
      throw new Error('URL 요청이 없습니다.');
    }
    const request = call[0];
    const url = new URL(request.url);
    expect(url.origin + url.pathname).toBe('https://business.juso.go.kr/addrlink/addrLinkApi.do');
    expect(url.searchParams.get('confmKey')).toBe('test-key=');
    expect(url.searchParams.get('keyword')).toBe('서울 & 길');
    expect(url.searchParams.get('resultType')).toBe('json');
    expect(url.searchParams.has('callback')).toBe(false);
    expect(request.credentials).toBe('omit');
    expect(request.headers.has('Authorization')).toBe(false);
  });

  it('10초 후 실제 요청 signal을 취소하고 시간 초과로 구분한다', async () => {
    fetchMock.mockImplementation(waitForAbort);
    const result = requestAddressJson(parameters).catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(await result).toBeInstanceOf(TimeoutError);
    const request = fetchMock.mock.calls[0]?.[0];
    expect(request instanceof Request && request.signal.aborted).toBe(true);
  });

  it('한 요청을 취소해도 동시 요청은 정상 완료한다', async () => {
    fetchMock
      .mockImplementationOnce(waitForAbort)
      .mockResolvedValueOnce(Response.json({ page: 2 }));
    const controller = new AbortController();
    const result = requestAddressJson(parameters, controller.signal).catch(
      (error: unknown) => error,
    );
    const next = requestAddressJson({ ...parameters, currentPage: '2' });
    await vi.advanceTimersByTimeAsync(0);
    controller.abort();
    expect(await result).toMatchObject({ name: 'AbortError' });
    await expect(next).resolves.toEqual({ page: 2 });
  });

  it('본문을 읽는 중에도 취소가 적용된다', async () => {
    const controller = new AbortController();
    // 실제 fetch처럼 요청 취소 시 응답 스트림도 오류로 종료합니다.
    fetchMock.mockImplementation((input) => {
      if (!(input instanceof Request)) {
        throw new Error('Request가 필요합니다.');
      }
      return Promise.resolve(
        new Response(
          new ReadableStream({
            start(stream) {
              input.signal.addEventListener(
                'abort',
                () => {
                  stream.error(new DOMException('취소', 'AbortError'));
                },
                { once: true },
              );
            },
          }),
        ),
      );
    });
    const result = requestAddressJson(parameters, controller.signal).catch(
      (error: unknown) => error,
    );
    await vi.advanceTimersByTimeAsync(0);
    controller.abort();
    expect(await result).toMatchObject({ name: 'AbortError' });
  });

  it('본문을 읽는 시간도 전체 10초 제한에 포함한다', async () => {
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(new Response(new ReadableStream())), 6000);
        }),
    );
    const result = requestAddressJson(parameters).catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(await result).toBeInstanceOf(TimeoutError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('HTTP 오류를 JSON 파싱 오류와 구분한다', async () => {
    fetchMock.mockResolvedValue(new Response('Unavailable', { status: 503 }));
    await expect(requestAddressJson(parameters)).rejects.toBeInstanceOf(HTTPError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('잘못된 JSON을 거부한다', async () => {
    fetchMock.mockResolvedValue(new Response('callback({})'));
    await expect(requestAddressJson(parameters)).rejects.toBeInstanceOf(SyntaxError);
  });

  it('ky의 네트워크 오류를 그대로 전달한다', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const error = await requestAddressJson(parameters).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(NetworkError);
  });

  it('이미 취소된 요청은 전송하지 않는다', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(requestAddressJson(parameters, controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('SSR에서는 전송하지 않는다', async () => {
    vi.stubEnv('SSR', true);
    await expect(requestAddressJson(parameters)).rejects.toThrow(
      '주소 조회는 브라우저에서만 사용할 수 있습니다.',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
