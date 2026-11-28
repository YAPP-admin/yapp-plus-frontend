/** 외부 탐색의 카카오맵 변환·복구·중복 실행을 검증하며 실제 OS 앱 실행은 기기에서 확인한다. */
import { describe, expect, it, vi } from 'vitest';
import { createExternalNavigation } from './external-navigation';

const MAP_URL = 'https://map.kakao.com/link/map/37.5665,126.978';
const APP_URL = 'kakaomap://look?p=37.5665,126.978';

function setup() {
  const openURL = vi.fn<(url: string) => Promise<unknown>>().mockResolvedValue(undefined);
  const showError = vi.fn<() => void>();
  return { openURL, showError, open: createExternalNavigation({ openURL, showError }) };
}

describe('카카오맵 외부 탐색', () => {
  it.each([
    ['37.5665,126.978', '37.5665,126.978'],
    ['0,0', '0,0'],
    ['-90,-180', '-90,-180'],
    ['90,180', '90,180'],
    ['1e-7,2e-7', '1e-7,2e-7'],
  ])('유효 좌표 %s를 위도·경도 순서로 앱에 전달한다', async (input, expected) => {
    const { open, openURL, showError } = setup();
    await open(`https://map.kakao.com/link/map/${input}`);
    expect(openURL.mock.calls).toEqual([[`kakaomap://look?p=${expected}`]]);
    expect(showError).not.toHaveBeenCalled();
  });

  it('앱 실행 실패 시 원래 HTTPS 링크를 한 번 연다', async () => {
    const { open, openURL, showError } = setup();
    openURL.mockRejectedValueOnce(new Error('앱 실행 실패'));
    await open(MAP_URL);
    expect(openURL.mock.calls).toEqual([[APP_URL], [MAP_URL]]);
    expect(showError).not.toHaveBeenCalled();
  });

  it('웹 대체 실행까지 실패하면 원문 오류 없이 안내한다', async () => {
    const { open, openURL, showError } = setup();
    openURL.mockRejectedValue(new Error('원문 오류'));
    await expect(open(MAP_URL)).resolves.toBeUndefined();
    expect(openURL.mock.calls).toEqual([[APP_URL], [MAP_URL]]);
    expect(showError.mock.calls).toEqual([[]]);
  });

  it.each([
    'https://example.com',
    'mailto:hello@example.com',
    'not a URL',
    'http://map.kakao.com/link/map/37,127',
    'https://map.kakao.com.example.com/link/map/37,127',
    'https://user:password@map.kakao.com/link/map/37,127',
    'https://map.kakao.com:8443/link/map/37,127',
    'https://map.kakao.com/link/map/37,127?extra=1',
    'https://map.kakao.com/link/map/37,127#extra',
    'https://map.kakao.com/link/map/37,127?',
    'https://map.kakao.com/link/map/37,127#',
    'https://map.kakao.com/link/map/37,127/extra',
    'https://map.kakao.com/link/map/장소,37,127',
    ...[
      '',
      ',127',
      '37,',
      '91,127',
      '37,181',
      '-91,0',
      '0,-181',
      'NaN,0',
      '0,Infinity',
      '1e999,0',
      '0x10,0',
    ].map((coordinates) => `https://map.kakao.com/link/map/${coordinates}`),
  ])('변환 대상이 아닌 URL은 기존 외부 탐색으로 전달한다: %s', async (url) => {
    const { open, openURL } = setup();
    await open(url);
    expect(openURL.mock.calls).toEqual([[url]]);
  });

  it('일반 외부 링크 실패도 처리하고 다음 실행을 허용한다', async () => {
    const { open, openURL, showError } = setup();
    openURL.mockRejectedValueOnce(new Error('실패'));
    await open('https://example.com');
    await open('https://example.com');
    expect(showError).toHaveBeenCalledTimes(1);
    expect(openURL).toHaveBeenCalledTimes(2);
  });

  it('동기 실행 오류도 웹 대체 경로로 복구한다', async () => {
    const { open, openURL } = setup();
    openURL.mockImplementationOnce(() => {
      throw new Error('동기 실패');
    });
    await open(MAP_URL);
    expect(openURL.mock.calls).toEqual([[APP_URL], [MAP_URL]]);
  });

  it.each([false, true])(
    '앱·웹 처리 중 중복 실행을 막고 실패 여부 %s와 무관하게 해제한다',
    async (fails) => {
      const { open, openURL, showError } = setup();
      const app = Promise.withResolvers<unknown>();
      const web = Promise.withResolvers<unknown>();
      openURL.mockReturnValueOnce(app.promise).mockReturnValueOnce(web.promise);
      const pending = open(MAP_URL);
      await open(MAP_URL);
      expect(openURL.mock.calls).toEqual([[APP_URL]]);
      app.reject(new Error('앱 없음'));
      await vi.waitFor(() => expect(openURL).toHaveBeenCalledTimes(2));
      await open(MAP_URL);
      expect(openURL.mock.calls).toEqual([[APP_URL], [MAP_URL]]);
      if (fails) {
        web.reject(new Error('웹 실패'));
      } else {
        web.resolve(undefined);
      }
      await pending;
      await open(MAP_URL);
      expect(openURL.mock.calls).toEqual([[APP_URL], [MAP_URL], [APP_URL]]);
      expect(showError).toHaveBeenCalledTimes(fails ? 1 : 0);
    },
  );
});
