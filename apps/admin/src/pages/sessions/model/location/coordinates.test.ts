/** 독립 PROJ 기준점과 단일 좌표 응답·오류 전파를 검증합니다. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';
import { HTTPError } from 'ky';
import { convertJusoCoordinates, lookupCoordinates } from './coordinates';

const fetchMock = vi.fn<typeof fetch>();
const selected = {
  administrativeAreaCode: '1144012700',
  roadNameManagementNumber: '114403113012',
  isUnderground: false,
  buildingMainNumber: '301',
  buildingSubNumber: '0',
  buildingManagementNumber: '1144012700115950000000001',
};
const entry = {
  admCd: selected.administrativeAreaCode,
  rnMgtSn: selected.roadNameManagementNumber,
  udrtYn: '0',
  buldMnnm: '301',
  buldSlno: '0',
  bdMgtSn: selected.buildingManagementNumber,
  entX: '945959.0381341814',
  entY: '1953851.7348996028',
};

/** 공식 가이드의 한국지역정보개발원 예제로 성공 응답을 구성합니다. */
function respond(items: unknown[] = [entry], totalCount = String(items.length)) {
  fetchMock.mockResolvedValue(
    Response.json({
      results: {
        common: { errorCode: '0', totalCount },
        juso: items,
      },
    }),
  );
}

beforeEach(() => {
  vi.stubEnv('SSR', false);
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('UTM-K 좌표 변환', () => {
  // pyproj 3.8.0 / PROJ 9.8.1, EPSG DB로 별도 계산한 기준점입니다. 왕복 테스트가 아닙니다.
  it.each([
    ['원점', 1000000, 2000000, 127.5, 38],
    ['서울', 953901.1653121515, 1952032.0809790879, 126.978, 37.5665],
    ['부산', 1143467.3796645734, 1688281.9820715077, 129.0756, 35.1796],
    ['제주', 910010.5457116975, 1501279.788866011, 126.5312, 33.4996],
  ])('%s 기준점과 경위도 순서가 일치한다', (_name, x, y, longitude, latitude) => {
    const actual = convertJusoCoordinates(x, y);
    expect(actual.longitude).toBeCloseTo(longitude, 7);
    expect(actual.latitude).toBeCloseTo(latitude, 7);
  });

  it.each([NaN, Infinity, -Infinity])('유한하지 않은 입력 %s를 거부한다', (value) => {
    expect(() => convertJusoCoordinates(value, 2000000)).toThrow(ZodError);
    expect(() => convertJusoCoordinates(1000000, value)).toThrow(ZodError);
  });
});

describe('좌표 조회', () => {
  it('선택한 식별자를 역매핑하고 이름 있는 경위도만 반환한다', async () => {
    respond();
    const result = await lookupCoordinates(selected, 'coordinate-test-key=');
    const request = fetchMock.mock.calls[0]?.[0];
    if (!(request instanceof Request)) {
      throw new Error('Request가 필요합니다.');
    }
    const url = new URL(request.url);
    expect(url.origin + url.pathname).toBe('https://business.juso.go.kr/addrlink/addrCoordApi.do');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      confmKey: 'coordinate-test-key=',
      admCd: entry.admCd,
      rnMgtSn: entry.rnMgtSn,
      udrtYn: '0',
      buldMnnm: '301',
      buldSlno: '0',
      resultType: 'json',
    });
    expect(request.credentials).toBe('omit');
    if (result.status !== 'success') {
      throw new Error('성공 결과가 필요합니다.');
    }
    expect(Object.keys(result.data)).toEqual(['latitude', 'longitude']);
    expect(result.data.longitude).toBeCloseTo(126.88793748501445, 7);
    expect(result.data.latitude).toBeCloseTo(37.582468731587156, 7);
  });

  it('응답의 부가 식별자 없이 좌표를 변환한다', async () => {
    respond([{ entX: entry.entX, entY: entry.entY }]);
    await expect(lookupCoordinates(selected, 'key')).resolves.toMatchObject({
      status: 'success',
    });
  });

  it('빈 결과를 거부한다', async () => {
    respond([]);
    await expect(lookupCoordinates(selected, 'key')).rejects.toThrow('좌표를 하나로');
  });
  it('결과가 둘이면 임의로 선택하지 않는다', async () => {
    respond([entry, entry]);
    await expect(lookupCoordinates(selected, 'key')).rejects.toThrow('좌표를 하나로');
  });
  it.each(['', ' ', 'NaN', 'Infinity', '123abc'])(
    '잘못된 좌표 문자열 %s를 거부한다',
    async (value) => {
      respond([{ ...entry, entX: value }]);
      await expect(lookupCoordinates(selected, 'key')).rejects.toBeInstanceOf(ZodError);
    },
  );
  it('업무 실패를 HTTP 오류와 구분한다', async () => {
    fetchMock.mockResolvedValue(Response.json({ results: { common: { errorCode: 'E0001' } } }));
    await expect(lookupCoordinates(selected, 'key')).resolves.toEqual({
      status: 'service-error',
      code: 'E0001',
    });
  });
  it('HTTPError를 그대로 전달한다', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 503 }));
    await expect(lookupCoordinates(selected, 'key')).rejects.toBeInstanceOf(HTTPError);
  });
  it('승인키가 없으면 전송하지 않는다', async () => {
    await expect(lookupCoordinates(selected, ' ')).rejects.toBeInstanceOf(ZodError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('이미 취소된 요청은 전송하지 않는다', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(lookupCoordinates(selected, 'key', controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('SSR에서는 전송하지 않는다', async () => {
    vi.stubEnv('SSR', true);
    await expect(lookupCoordinates(selected, 'key')).rejects.toThrow('브라우저');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
