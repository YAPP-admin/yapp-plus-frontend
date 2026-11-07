# 작업 목록: 공식 CLI 중심 TestFlight 배포

**입력**: [명세](spec.md), [계획](plan.md), [상태](data-model.md), [호출 계약](contracts/delivery.md)
**진행 경계**: 로컬 빌드 유지·공식 기능 중심 축소 승인. 기준 파일 PR 활성화 승인.
기존 T001~T037 계획은 명세 커밋 `26918286`에 보존한다. 폐기한 초안의 완료 표시를 새 구현에 승계하지 않는다.

## 설계 축소

- [x] R001 plan.md·contracts/delivery.md에 고정 공식 CLI와 자체 구현 경계를 기록한다.
- [x] R002 자체 config/ledger 초안과 별도 테스트 실행기 구성을 제거하고 기존 test를 복원한다.
- [x] R003 data-model.md·contracts/delivery.md에 활성화 방식 선택 및 최소 보관·중지·재개 계약을 확정한다.
- [x] R004 validation.md에 축소 변경 검증과 사용자 리뷰를 기록한다.

## 기존 1단계 — PR 검사와 보고 전용

- [ ] R005 apps/mobile의 기존 Vitest에 버전 규칙·공식 출력의 필수 입력 검증 회귀를 추가한다.
- [ ] R006 공식 로컬 Fingerprint API와 최소 버전 판정 함수를 연결한다. 정책 파일 변경·수집 실패·보완 native 입력을 검증한다.
- [ ] R007 .github/workflows/ci.yml에 별도 읽기 전용 PR base/merge 검사를 연결한다. 배포 비밀·인증 캐시·artifact는 제공하지 않는다.
- [ ] R008 .github/workflows/mobile-delivery.yml에서 성공 main CI·정확한 SHA·Turbo affected 누적 비교·공식 config/Fingerprint와 보고를 연결한다.
- [ ] R009 validation.md에 두 OS 호환성 비교·누적 변경·보고 전용 검증과 단계 리뷰를 기록한다.

기준 파일 전용 검증기·테스트 초안은 제거했다. R005는 아직 미구현이며 기준 파일 검사는 R014에서 실제 활성화 경계에 연결한다.

## 기존 2단계 — 조건부 IPA 생성

- [ ] R010 mobile-delivery.yml에서 공식 local build와 Actions artifact를 연결하고 출처·IPA·native 키를 검증한다.
- [ ] R011 app.config.ts·eas.json에 새 기준 버전과 명시적 production 환경을 적용한다.
- [ ] R012 validation.md에 실제 빌드·대기 IPA 재사용·만료·동일 runtime 충돌 검증 및 단계 리뷰를 기록한다.

## 기존 3단계 — 제출·활성화

- [ ] R013 mobile-manual.yml에서 지정 IPA만 공식 submit --path로 제출한다.
- [ ] R014 기준 파일 PR 검증·병합과 최신 main 재평가를 연결하고 apps/mobile/README.md에 실기기 확인 절차를 기록한다.
- [ ] R015 validation.md에 실제 제출·로그인·WebView·위치·활성화 검증과 단계 리뷰를 기록한다.

## 기존 4단계 — OTA·복구

- [ ] R016 mobile-delivery.yml에서 호환성·최신성·중복·불명확한 결과를 검사하고 공식 update를 호출한다.
- [ ] R017 mobile-manual.yml에서 공식 조회·republish/embedded 복구 및 명시적 재개를 연결한다.
- [ ] R018 apps/mobile/README.md·validation.md에 실패 시 수동 확인·실기기 OTA/복구·품질 게이트·단계 리뷰를 기록한다.

R001–R004 → R005–R009 → R010–R012 → R013–R015 → R016–R018 순서로 진행한다.
각 리뷰 단위는 실제 base 대비 800줄 미만이며 650줄부터 분리를 검토한다. 새 단계·Git 외부 작업 승인은 별도다.
