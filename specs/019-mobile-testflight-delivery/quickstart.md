# 단계별 검증 절차

이 문서는 후속 구현의 실행 절차다. 아직 존재하지 않는 workflow를 지금 실행한 것으로 해석하지 않는다.

## 0단계 문서 검증

- 이슈 #367, spec 요구사항, plan, 상태 모델, 계약, tasks의 범위·단계 순서를 대조한다.
- Spec Kit check-prerequisites로 기능 위치와 산출물을 검사한다.
- 변경 문서 형식·상대 링크·요구사항/작업 ID·diff와 전체 변경량을 검사한다.
- 기본 `mise exec -- node --run check` 결과와 미실행 항목을 validation에 기록한다.

## 1단계 정책 회귀

1. JS 수정 / native 모듈 변경 / 버전만 증가 / 버전 감소 / native 변경+버전 증가를 각각 준비한다.
2. PR merge 결과와 정확한 base를 비교하고 버전 누락·감소 실패를 확인한다.
3. API·브리지·설정 패키지·lockfile·eas.json·.easignore·native patch 변경을 검사한다.
4. autolinking 실패·필수 source 누락·기준 조회 오류·초기화 후 빈 이력은 blocked, 최초 미등록은 bootstrap으로 구분한다.
5. 모바일 A 실패·취소 후 문서 B 성공 시 A의 변경을 누적 판정한다.
6. 같은 SHA·lockfile·Node/pnpm·정책 버전·공개 환경·CNG 상태를 기록하고 Linux/macOS의 source/hash·native digest·최종 호환성 키를 비교한다. 불일치 시 2단계를 막고 도구·정책 변경 시 다시 검증한다.
7. report-only에서 실제 build/update/submit이 0회인지 확인한다.

## 2단계 기준 IPA

- Expo token, 기존 인증서·프로비저닝, remote build number 초기값, runner 사용 권한을 먼저 확인한다.
- initialize의 기록 ID와 외부 설정을 대조하고 기존 이력 소실을 최초 도입으로 처리하지 않는지 검사한다.
- 새 앱 버전의 검증된 main을 build-only 모드에서 실행한다.
- IPA의 bundle ID·채널·runtime·build number와 메타데이터·digest 일치를 확인한다.
- 재실행은 유효한 IPA를 재사용하고 만료·명시적 rebuild는 새 build number를 만든다.
- 제출·활성화·OTA가 발생하지 않았고 자격 증명이 artifact에 없는지 검사한다.

## 3단계 제출과 실기기

- 실행 ID·artifact ID를 지정해 제출한다. 다른 저장소·workflow·digest를 넣으면 거부되어야 한다.
- Apple 처리 및 테스터 접근 가능 상태를 확인하고 TestFlight에서 정확한 버전을 설치한다.
- Google·Apple 로그인, 세션 복원, WebView 표시·복귀, 위치 권한·출석을 확인한다.
- 증거 링크와 verified=true로 활성화한다. 확인 전 자동 OTA와 이전 버전 활성화가 거부되는지 검사한다.
- 제출 대기 중 JS 변경은 재빌드하지 않으며 활성화 이후 최신 main 성공 CI만 재평가한다.

## 4단계 OTA와 복구

- active 모드에서 JS 수정 후 Update group·runtime·SHA를 확인하고 앱 재실행으로 적용을 확인한다.
- build-only에서 active로 바꾼 직후 evaluate를 실행해 새 push 없이도 누적 변경을 따라잡는지 확인한다.
- 오래된 CI 재실행, 중복 실행, 자동/수동 역순 완료, 취소된 대기 실행을 재현한다.
- 외부 게시 성공 후 result 저장 실패를 대역으로 재현해 유일한 결과 복구와 불명확한 결과 차단을 검사한다.
- 외부 미실행 확인 후 수동 종결·재시도와 계속 불명확한 작업의 차단을 구분한다.
- pause → 정상 group 재게시 또는 embedded 복귀 → 실제 기기 복구 확인 → resume 순서를 검증한다.
- rollback 실패 시 pause 유지, 중단 중 대기 자동 실행의 게시 금지를 확인한다.
- 복구 소스 SHA가 비교 기준이 되고 resume 승인 없이는 문제 OTA가 재게시되지 않는지 확인한다.
- 네이티브 결함은 OTA 복구와 구분해 문제 빌드 배포 중단·수정 IPA 제출로 대응한다.

## 단계별 제출 기준

기본 check, workflow·빌드 설정 변경 시 build, 모바일 설정·의존성 변경 시 expo:doctor를 실행한다.
원격 Turbo 캐시 재사용과 새 실행을 구분하고 실제 iOS 빌드·실기기 성공을 별도로 기록한다.
각 단계 종료 후 리뷰와 다음 단계 진행 확인 전에는 다음 구현을 시작하지 않는다.
