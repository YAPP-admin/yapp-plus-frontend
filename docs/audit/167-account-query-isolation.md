# 계정 캐시와 SSR 클라이언트 격리 조사 기록

발견 ID: C03. 관련 이슈: #167.

## 현재 확인

Admin factory는 호출마다 새 QueryClient를 반환하고 Web Provider는 `useState`로 인스턴스를
보관합니다. 따라서 앱 QueryClient가 모듈 전역 singleton이라는 주장은 맞지 않습니다.
반면 생성 SDK의 기본 `client`는 모듈 수준이며, 기본 query key는 operation·baseUrl·요청
body/headers/path/query로 구성됩니다. 전역 client auth 변경이 자동으로 계정별 key를
만들어 주지는 않습니다. 공개 generated 진입점은 기본 client를 내보냅니다.

## 인증 연결 전 확정할 경계

- 계정 수명에 맞춰 QueryClient를 교체할지, 명시적 계정 key를 사용할지 정합니다. 로그아웃은
  캐시 삭제뿐 아니라 진행 중 요청과 늦은 성공 콜백도 처리해야 합니다.
- SSR에서 전역 `client.setConfig`로 사용자 인증을 바꾸지 않습니다. 요청별 client 전달을
  정식 공개 API로 제공할 필요가 있으면 생성기 또는 wrapper에서 설계합니다. 앱이 패키지
  내부 파일을 직접 import하는 임시 해결은 사용하지 않습니다.
- 인증 응답·화면 이동·캐시 폐기 순서와 취소할 수 없는 응답의 무시 기준을 Spec Kit으로
  정의합니다. 계정별 key에 토큰 원문을 넣어 DevTools·로그로 노출하지 않습니다.

## 완료 검증

1. A 데이터 조회 중 로그아웃→B 로그인 후 A의 지연 응답을 완료해 B 화면·캐시에 A가 없는지 확인합니다.
2. 같은 operation을 다른 인증으로 병렬 SSR 호출해 요청 header와 응답 캐시의 분리를 확인합니다.
3. 로그인 실패·갱신 실패·브라우저 뒤로가기에서도 이전 계정 데이터가 재노출되지 않는지 확인합니다.
4. 새 client 수명 정책을 되돌릴 때 캐시를 폐기하고 다시 인증하는 복구 경로를 검증합니다.

관련: #107, #161, #168, #172. SDK 오류 처리 수정을 계정 격리 완료로 간주하지 않습니다.

## 근거와 완료 판정

기준: `e0d4bf92f007c075b53adc0938d9abe5e8ba4572`.

- [apps/admin/src/query-client.ts](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/admin/src/query-client.ts)
- [apps/web/src/app/providers.tsx](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/web/src/app/providers.tsx)
- [packages/api/src/generated/client.gen.ts](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/packages/api/src/generated/client.gen.ts)
- [packages/api/src/generated/@tanstack/react-query.gen.ts](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/packages/api/src/generated/@tanstack/react-query.gen.ts)
- [packages/api/package.json](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/packages/api/package.json)

이번 PR은 확인된 현재 상태와 후속 검증 기준을 기록합니다. 미실행 항목을 통과로 처리하지 않으며,
이슈는 실제 완료 조건을 충족할 때 닫습니다. dots 보고서의 재현은 기존 검증이며 아래 신규 확인과
구분합니다.
