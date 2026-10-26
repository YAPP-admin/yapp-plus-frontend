/** 행안부의 단일 좌표 응답을 검증하고 UTM-K 좌표를 화면용 경위도로 변환합니다. */
import proj4 from 'proj4';
import { z } from 'zod';
import { jusoClient } from './juso-client';
import type { AddressLookupReference, CoordinatesViewModel } from './location-view-model';

// 한국 통합좌표계(UTM-K)의 표준 투영 정의입니다. 서비스에 맞춰 조정하는 값이 아닙니다.
// 원점 위도 38°·기준 경도 127.5°·축척 0.9996·동/북 오프셋 1,000,000m/2,000,000m.
// PROJ의 EPSG:5179 정의와 대조했으며 근거와 독립 기준점은 research.md에 기록합니다.
const EPSG_5179_PROJ_DEFINITION =
  '+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs';

proj4.defs('EPSG:5179', EPSG_5179_PROJ_DEFINITION);
const coordinateNumber = z
  .string()
  .regex(/^-?\d+(\.\d+)?$/)
  .transform(Number)
  .pipe(z.number().finite());
const commonSchema = z.object({
  results: z.object({ common: z.object({ errorCode: z.string().min(1) }) }),
});
const responseSchema = z.object({
  results: z.object({
    juso: z.array(
      z.object({
        entX: coordinateNumber,
        entY: coordinateNumber,
      }),
    ),
  }),
});
const coordinatesSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
});

export type CoordinatesResult =
  | { status: 'success'; data: CoordinatesViewModel }
  | { status: 'service-error'; code: string };

/** 미터 단위 [동쪽 X, 북쪽 Y]를 변환하고 [경도, 위도] 배열을 이름 있는 객체로 바꿉니다. */
export function convertJusoCoordinates(x: number, y: number): CoordinatesViewModel {
  const point = z.tuple([z.number().finite(), z.number().finite()]).parse([x, y]);
  const [longitude, latitude] = proj4('EPSG:5179', 'EPSG:4326', point);
  return coordinatesSchema.parse({ latitude, longitude });
}

/** 요청한 주소의 단일 좌표를 반환합니다. 전송·검증 오류는 호출자에게 전파합니다. */
export async function lookupCoordinates(
  reference: AddressLookupReference,
  approvalKey: string,
  signal?: AbortSignal,
): Promise<CoordinatesResult> {
  if (import.meta.env.SSR) {
    throw new Error('좌표 조회는 브라우저에서만 사용할 수 있습니다.');
  }
  signal?.throwIfAborted();
  const key = z.string().trim().min(1).parse(approvalKey);
  const payload = await jusoClient
    .get('addrCoordApi.do', {
      signal,
      searchParams: {
        confmKey: key,
        admCd: reference.administrativeAreaCode,
        rnMgtSn: reference.roadNameManagementNumber,
        udrtYn: reference.isUnderground ? '1' : '0',
        buldMnnm: reference.buildingMainNumber,
        buldSlno: reference.buildingSubNumber,
        resultType: 'json',
      },
    })
    .json<unknown>();
  signal?.throwIfAborted();
  const { errorCode } = commonSchema.parse(payload).results.common;
  if (errorCode !== '0') {
    return { status: 'service-error', code: errorCode };
  }
  const { juso } = responseSchema.parse(payload).results;
  const match = juso[0];
  if (juso.length !== 1 || !match) {
    throw new Error('선택한 주소에 대응하는 좌표를 하나로 확인할 수 없습니다.');
  }
  return { status: 'success', data: convertJusoCoordinates(match.entX, match.entY) };
}
