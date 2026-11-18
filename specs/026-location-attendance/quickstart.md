# 검증 절차

## 전제

이 문서는 후속 구현 검증 절차다. 현재 단계의 실제 결과는 [validation.md](./validation.md)에 기록한다.
Node·pnpm은 mise 고정 버전을 사용하고 비밀 값·실제 위치·코드는 증거에 남기지 않는다.

## 자동 검증

```sh
mise exec -- pnpm --filter @yapp-plus/web test -- src/pages/home/model/location-attendance.test.ts
mise exec -- pnpm --filter @yapp-plus/web test -- src/pages/home/ui/attendance-code.test.tsx
mise exec -- pnpm --filter @yapp-plus/web test -- stackflow/src/stack.test.tsx stackflow/src/account-boundary.test.tsx
mise exec -- node --run check
mise exec -- node --run build
```

- 판정 단위 테스트: 좌표 범위·null·0, precise, accuracy 경계, distance 경계·계산 실패.
- 제출 테스트: 위치 완료 전 POST 0회, 허용 시 기존 본문으로 1회, 실패 시 0회. 재시도는 새 위치 1회.
- 통합 테스트: 활성 시트 종료·계정 변경·세션 ID/좌표/가능 상태 변경 뒤 늦은 결과의 POST·탐색 0회.
- 기존 성공 mutation의 context와 완료 표시·조회 갱신을 확인한다. 위치 실패·무효화가 성공으로 기록되지 않아야 한다.
- 위치 원문이 HTTP 본문·Query/Mutation 캐시·storage·앱 로그에 남지 않는지 합성 표본으로 확인한다.
- 각 실패는 가장 가까운 계층에서 검증한다. 외부 거리 공식 전체나 OS 권한 자체를 중복 단위 테스트하지 않는다.

## 브라우저·iOS 실기기

1. 일반 브라우저에서 실제 위치 팝업·위치 우회 제출이 없는지 확인한다.
2. 지원 iOS 앱에 로그인하고 코드 시트 진입만으로 위치를 요청하지 않는지 확인한다.
3. 유효한 코드 확인 시 최초 권한 허용 → 위치 판정 → 서버 성공 → 완료·홈 반영을 확인한다.
4. 거부·재요청 불가·대략 위치·서비스 꺼짐·설정 열기 실패를 재현하고 코드 유지·POST 0회를 확인한다.
5. 설정 복귀·연결 복구만으로 자동 측정/제출되지 않는지 확인한다.
6. 실제 세션 장소 실내와 반경 안팎에서 정확한 권한·오차 50m 기준을 확인한다. 반복 실패는 운영진 처리로 안내한다.
7. 작은 화면·키보드·터치·VoiceOver의 목적·진행·오류 안내와 버튼 접근성을 확인한다.
8. 앱 재시작 후 완료 표시가 복원되지 않는 기존 제한을 별도 기록한다. 실제 출석을 만들 검증 계정·세션은 사전 확보한다.

## 기록과 출시

- 시뮬레이터 합성 위치 결과를 실기기 GPS 성공으로 보고하지 않는다. UI 캡처는 `.context/`에 저장한다.
- 실제 장소 검증은 날짜·기기·권한·오차 기준 통과 여부·결과만 기록하고 사용자 원문 좌표는 제외한다.
- 지원 앱 버전·위치 메서드 존재, 일반 웹·미지원 앱 차단을 확인하고 iOS/Android 적용 상태를 구분한다.
- check·build는 새 실행/캐시 재사용/실패/미실행을 구분한다. 모바일 변경이 없으므로 expo:doctor는 이번 필수 항목이 아니다.
- 출시 준비 완료 전 실기기 미검증·현장 반복 실패를 해결하거나 별도로 사용자 판단을 받는다. 기준을 임의 완화하지 않는다.
- 배포는 별도 승인 후 main의 검증 SHA로 수행하고, 장애 시 이전 검증 웹 커밋으로 복구하는 영향까지 기록한다.
