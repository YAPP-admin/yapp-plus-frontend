/** 행안부 주소 응답을 검증하고 읽기 쉬운 검색 결과로 변환합니다. */
import { z } from 'zod';
import { requestAddressJson } from './address-request';
import type { AddressSearchViewModel } from './location-view-model';

const pageSize = 10;
const nonempty = z.string().trim().min(1);
const digits = z.string().regex(/^\d+$/);
const integerString = digits
  .transform(Number)
  .pipe(z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER));
const inputSchema = z.object({
  keyword: nonempty,
  page: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  approvalKey: nonempty,
});
const envelopeSchema = z.object({
  results: z.object({ common: z.object({ errorCode: nonempty }) }),
});
const responseSchema = z.object({
  results: z.object({
    common: z.object({
      currentPage: integerString.pipe(z.number().positive()),
      countPerPage: integerString.pipe(z.literal(pageSize)),
      totalCount: integerString,
    }),
    juso: z
      .array(
        z.object({
          roadAddr: nonempty,
          admCd: digits,
          rnMgtSn: digits,
          udrtYn: z.enum(['0', '1']),
          buldMnnm: digits,
          buldSlno: digits,
          bdMgtSn: digits,
        }),
      )
      .max(pageSize),
  }),
});

// HTTP 성공 응답 안의 업무 실패는 ky의 HTTPError와 별개의 결과입니다.
export type AddressSearchResult =
  | { status: 'success'; data: AddressSearchViewModel }
  | { status: 'service-error'; code: string };

/** 입력과 DTO를 검증합니다. 업무 실패는 결과로 반환하고 전송·검증 오류는 호출자에게 전파합니다. */
export async function searchAddresses(
  input: { keyword: string; page: number; approvalKey: string },
  signal?: AbortSignal,
): Promise<AddressSearchResult> {
  const { keyword, page, approvalKey } = inputSchema.parse(input);
  const payload = await requestAddressJson(
    {
      confmKey: approvalKey,
      keyword,
      currentPage: String(page),
      countPerPage: String(pageSize),
    },
    signal,
  );
  const { errorCode } = envelopeSchema.parse(payload).results.common;
  if (errorCode !== '0') {
    // 공급자의 오류 메시지는 화면에 직접 노출하지 않습니다.
    return { status: 'service-error', code: errorCode };
  }
  const { common, juso } = responseSchema.parse(payload).results;
  if (common.currentPage !== page) {
    throw new Error('요청한 페이지와 주소 검색 응답이 일치하지 않습니다.');
  }
  return {
    status: 'success',
    data: {
      items: juso.map((item) => ({
        roadAddress: item.roadAddr,
        lookupReference: {
          administrativeAreaCode: item.admCd,
          roadNameManagementNumber: item.rnMgtSn,
          isUnderground: item.udrtYn === '1',
          buildingMainNumber: item.buldMnnm,
          buildingSubNumber: item.buldSlno,
          buildingManagementNumber: item.bdMgtSn,
        },
      })),
      page,
      pageSize,
      totalCount: common.totalCount,
      hasPreviousPage: page > 1,
      hasNextPage: page < Math.ceil(common.totalCount / pageSize),
    },
  };
}
