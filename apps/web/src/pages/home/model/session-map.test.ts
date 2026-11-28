/** 좌표 경계에서 지도 URL의 순서와 누락·범위 오류를 검증한다. */
import { expect, it } from 'vitest';
import { getSessionMapUrl } from './session-map';

it.each([
  [37.5665, 126.978],
  [0, 0],
  [-90, -180],
  [90, 180],
])('유효 좌표 %s,%s를 연결한다', (latitude, longitude) => {
  expect(getSessionMapUrl({ roadAddress: '서울 & 중구/110', latitude, longitude })).toBe(
    `https://m.map.kakao.com/scheme/search?q=${encodeURIComponent('서울 & 중구/110')}&p=${latitude},${longitude}`,
  );
});
it.each([
  [null, 0],
  [0, null],
  [91, 0],
  [0, -181],
  [NaN, 0],
  [0, Infinity],
])('잘못된 좌표 %s,%s는 연결하지 않는다', (latitude, longitude) => {
  expect(getSessionMapUrl({ roadAddress: '서울 & 중구/110', latitude, longitude })).toBeNull();
});

it.each([null, '', '   '])(
  '주소가 없으면 좌표가 있어도 링크를 만들지 않는다: %s',
  (roadAddress) => {
    expect(getSessionMapUrl({ roadAddress, latitude: 37.5665, longitude: 126.978 })).toBeNull();
  },
);
