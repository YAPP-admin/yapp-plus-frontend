# 교차 origin 쿠키 인증의 미확정 계약 기록

발견 ID: C10. 관련 이슈: #172.

## 현재 확인

SDK 기본 baseUrl은 웹 앱과 다른 AWS API origin입니다. 생성 client는 요청 옵션에
`credentials`가 명시되면 RequestInit에 전달합니다. 이 사실만으로 서버가 쿠키를 사용하는지,
운영 CORS가 어떤 origin을 허용하는지, 인증이 실제로 실패하는지는 알 수 없습니다.

## 서버와 합의할 계약

| 항목      | 확인할 내용                                                     |
| --------- | --------------------------------------------------------------- |
| 인증 방식 | 웹 쿠키·모바일 토큰 사용 여부와 갱신 경로                       |
| 쿠키      | 이름·Domain·Path·HttpOnly·SameSite·Secure·만료/삭제 조건        |
| CORS      | 실제 웹·Preview origin, credentials 허용, preflight와 오류 응답 |
| CSRF      | 서버 검증 방식, 전송 header, 외부 origin의 상태 변경 거절       |
| 로그아웃  | 서버 세션 폐기·쿠키 삭제·#167 캐시 폐기의 순서                  |
| 만료      | #168 refreshToken 응답 계약과 갱신 실패의 사용자 흐름           |

구현 전 Spec Kit에 인증 수명·실패 처리·롤백을 정리합니다. 토큰이나 쿠키 값을 PR·로그·
스크린샷에 남기지 않습니다. 설정 검증은 값 대신 속성, 상태 코드, 요청 origin과 결과만
기록합니다. 전체 SDK에 `credentials: include`를 일괄 추가해 계약을 추정하지 않습니다.

## 완료 검증

실제 배포 웹 origin에서 로그인→보호 API→갱신→로그아웃을 수행합니다. 허용되지 않은
origin·쿠키 만료·preflight 실패·갱신 실패도 포함합니다. iOS WebView의 쿠키 저장·앱 재시작·
OAuth 복귀는 별도로 확인합니다. 서버 계약과 적용 설정이 일치하고 로그아웃 후 캐시가
격리되어야 완료입니다. 실패 시 클라이언트와 서버 설정을 함께 이전 계약으로 복구합니다.

관련: #107, #161, #165, #167, #168.

## 근거와 완료 판정

기준: `e0d4bf92f007c075b53adc0938d9abe5e8ba4572`.

- [packages/api/src/generated/client.gen.ts](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/packages/api/src/generated/client.gen.ts)
- [packages/api/src/generated/client/client.gen.ts](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/packages/api/src/generated/client/client.gen.ts)
- [apps/web/src/app/providers.tsx](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/web/src/app/providers.tsx)
- [apps/mobile/README.md](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/mobile/README.md)

이번 PR은 확인된 현재 상태와 후속 검증 기준을 기록합니다. 미실행 항목을 통과로 처리하지 않으며,
이슈는 실제 완료 조건을 충족할 때 닫습니다. dots 보고서의 재현은 기존 검증이며 아래 신규 확인과
구분합니다.
