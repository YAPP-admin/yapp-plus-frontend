# Web refreshToken 응답 계약 조사 (C05 · #168)

## 확인 결과

2026-10-29에 현재 생성 Zod로 합성 응답 3종을 새로 검사했다.
`accessToken`은 합성 문자열, `expiresIn`은 3600으로 동일하게 두었다.

| refreshToken 입력 | zAuthSessionResponse.safeParse |
| ----------------- | ------------------------------ |
| 필드 생략         | 실패                           |
| null              | 성공                           |
| 합성 문자열       | 성공                           |

[`zod.gen.ts`](../../packages/api/src/generated/zod.gen.ts)의 필드는 `z.string().nullable()`다.
생략 가능과 null 허용은 다른 계약이다. [`openapi-ts.config.ts`](../../packages/api/openapi-ts.config.ts)는
`HEY_API_SDK_VALIDATION=true`로 생성할 때만 SDK validation을 켠다. 현재 기본 생성에서 위 검증을
자동 실행한다고 가정하지 않는다.

이번 OpenAPI 갱신 #198에 사용한 서버 스냅샷에서도 `AuthSessionResponse.required`에
`refreshToken`이 있고 타입은 string/null이다. 설명은 Web cookie 흐름에서 body 필드를 생략한다고
되어 있어 구조와 설명의 불일치가 남는다. 원본 SHA-256은
`6aad25b2b12b69e7e7b8010d15acc5946569d63949270869b57b089a4f7dda37`이다.
새 명세로 재생성하는 것만으로 이 불일치를 해결하지 않는다.

## 아직 확인하지 않은 사실

실제 Web·native 로그인/갱신 응답은 호출하지 않았다. 이번 결과는 합성 값의 스키마 검증이며
운영 로그인 실패나 실제 토큰 유출의 증거가 아니다. 관리자 로그인은 현재 개발 mock이고
프로덕션은 unavailable을 반환하므로 이를 회원 Web cookie 인증의 증거로 쓰지 않는다.

## upstream 결정과 완료 조건

백엔드 담당자와 실제 응답에서 토큰 값을 제거한 필드 존재·타입 증거를 확인한 뒤 아래 중
의도한 계약을 확정한다. 이 조사 PR은 정책을 대신 결정하거나 #168을 닫지 않는다.

- Web에서 생략이 맞다면 원본 OpenAPI required 목록에서 제외하거나 Web/native 응답 schema를
  분리한다. native의 필수 필드가 함께 약해지는지 검토한다.
- Web에서 null이 맞다면 실제 응답과 설명을 null로 통일한다. 기존 소비자의 생략 기대도 점검한다.
- 확정된 원본에서 SDK·타입·Zod를 재생성하고 동일 원본의 재생성 diff가 없어야 한다.
- Web/native 로그인·갱신 각각에 대해 validation off/on의 결과와 생략·null·문자열을 비교한다.
  쿠키 저장·재전송은 #172, 계정 전환 격리는 #167과 연결하되 각각 별도로 검증한다.

생성 파일을 직접 완화하거나 wrapper에서 누락 필드를 임의로 null로 채우지 않는다.
계약 변경 전 Spec Kit 요구사항·계획과 이전 원본으로 재생성하는 롤백을 마련한다.
지속 테스트는 인증 소비자 통합 검증에서 다루며 #158–161의 SDK 테스트 예외를 확대하지 않는다.
