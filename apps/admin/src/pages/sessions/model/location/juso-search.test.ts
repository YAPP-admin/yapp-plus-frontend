/** 주소 DTO 검증·페이지 계산·ViewModel 매핑과 업무 오류 구분을 검증합니다. */
import { ZodError } from 'zod';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requestAddressJson } from './address-request';
import { searchAddresses } from './juso-search';

vi.mock('./address-request', () => ({ requestAddressJson: vi.fn<typeof requestAddressJson>() }));
const request = vi.mocked(requestAddressJson);
const input = { keyword: ' 세종대로 ', page: 1, approvalKey: 'test-key=' };
const item = {
  roadAddr: '서울특별시 중구 세종대로 110',
  admCd: '0111000000',
  rnMgtSn: '000123',
  udrtYn: '0',
  buldMnnm: '110',
  buldSlno: '0',
  bdMgtSn: '001234',
};
/** 페이지 경계와 필드 검증에 사용할 최소 정상 응답을 만듭니다. */
function response(totalCount = '11', currentPage = '1') {
  return {
    results: {
      common: { errorCode: '0', currentPage, countPerPage: '10', totalCount },
      juso: [item],
    },
  };
}
beforeEach(() => {
  request.mockReset();
});

describe('주소 검색 ViewModel', () => {
  it('요청 조건과 signal을 전달하고 원본 필드 없이 명시적으로 매핑한다', async () => {
    request.mockResolvedValue(response());
    const controller = new AbortController();
    const result = await searchAddresses(input, controller.signal);
    expect(request).toHaveBeenCalledWith(
      { confmKey: 'test-key=', keyword: '세종대로', currentPage: '1', countPerPage: '10' },
      controller.signal,
    );
    expect(result).toEqual({
      status: 'success',
      data: {
        items: [
          {
            roadAddress: item.roadAddr,
            lookupReference: {
              administrativeAreaCode: '0111000000',
              roadNameManagementNumber: '000123',
              isUnderground: false,
              buildingMainNumber: '110',
              buildingSubNumber: '0',
              buildingManagementNumber: '001234',
            },
          },
        ],
        page: 1,
        pageSize: 10,
        totalCount: 11,
        hasPreviousPage: false,
        hasNextPage: true,
      },
    });
  });

  it('지하 코드 1을 boolean으로 변환한다', async () => {
    const payload = response();
    payload.results.juso = [{ ...item, udrtYn: '1' }];
    request.mockResolvedValue(payload);
    expect(await searchAddresses(input)).toMatchObject({
      data: { items: [{ lookupReference: { isUnderground: true } }] },
    });
  });

  it.each([
    ['0', 1, false, false],
    ['10', 1, false, false],
    ['11', 1, false, true],
    ['11', 2, true, false],
  ])('전체 %s건의 %s페이지 경계를 계산한다', async (total, page, previous, next) => {
    const payload = response(total, String(page));
    if (total === '0') {
      payload.results.juso = [];
    }
    request.mockResolvedValue(payload);
    expect(await searchAddresses({ ...input, page })).toMatchObject({
      status: 'success',
      data: { page, totalCount: Number(total), hasPreviousPage: previous, hasNextPage: next },
    });
  });

  it('HTTP 200 업무 실패를 성공·빈 결과와 구분하고 원본 메시지를 전달하지 않는다', async () => {
    request.mockResolvedValue({
      results: { common: { errorCode: 'E0001', errorMessage: '외부 메시지' } },
    });
    expect(await searchAddresses(input)).toEqual({ status: 'service-error', code: 'E0001' });
  });

  it.each(['', '-1', '1.5', 'abc', '9007199254740992'])(
    '잘못된 전체 수 %s를 거부한다',
    async (total) => {
      request.mockResolvedValue(response(total));
      await expect(searchAddresses(input)).rejects.toBeInstanceOf(ZodError);
    },
  );

  it.each(['roadAddr', 'admCd', 'rnMgtSn', 'buldMnnm', 'buldSlno', 'bdMgtSn'])(
    '필수 필드 %s가 비어 있으면 거부한다',
    async (field) => {
      const payload = response();
      payload.results.juso = [{ ...item, [field]: '' }];
      request.mockResolvedValue(payload);
      await expect(searchAddresses(input)).rejects.toBeInstanceOf(ZodError);
    },
  );

  it('알 수 없는 지하 코드를 거부한다', async () => {
    const payload = response();
    payload.results.juso = [{ ...item, udrtYn: '2' }];
    request.mockResolvedValue(payload);
    await expect(searchAddresses(input)).rejects.toBeInstanceOf(ZodError);
  });

  it.each([null, {}, { results: { common: { errorCode: '0' }, juso: null } }])(
    '잘못된 응답 구조를 거부한다',
    async (payload) => {
      request.mockResolvedValue(payload);
      await expect(searchAddresses(input)).rejects.toBeInstanceOf(ZodError);
    },
  );

  it('다른 페이지 응답을 거부한다', async () => {
    request.mockResolvedValue(response('20', '2'));
    await expect(searchAddresses(input)).rejects.toThrow('페이지');
  });

  it.each([
    { ...input, keyword: ' ' },
    { ...input, approvalKey: '' },
    { ...input, page: 0 },
    { ...input, page: 1.5 },
  ])('잘못된 입력은 전송 전에 거부한다', async (invalid) => {
    await expect(searchAddresses(invalid)).rejects.toBeInstanceOf(ZodError);
    expect(request).not.toHaveBeenCalled();
  });

  it('전송 오류는 변경하지 않는다', async () => {
    const error = new DOMException('취소', 'AbortError');
    request.mockRejectedValue(error);
    await expect(searchAddresses(input)).rejects.toBe(error);
  });
});
