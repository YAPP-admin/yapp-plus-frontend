# 작업 목록: main 자동 OTA와 수동 로컬 빌드

**현재 정책**: [spec.md](spec.md), [plan.md](plan.md). 이전 R001–R018 계획은 대체됐다.

- [x] S001 사용자가 승인한 간소화 정책과 복구 절차를 명세·계획에 반영한다.
- [x] S002 PR의 Expo 지문·보완 입력·버전 규칙과 테스트를 연결한다.
- [x] S003 고정 EAS CLI로 main 성공 CI 이후 OTA 게시를 연결하고 기준 파일을 제거한다.
- [x] S004 앱 README에 수동 local build·지정 IPA 제출·중지·복구 절차를 기록한다.
- [x] S005 현재 리뷰의 check·build·doctor·workflow 검증 결과를 제출하고 사용자 리뷰를 받는다.
- [x] S006a 같은 저장소 PR의 원격 Linux/macOS 검사와 main CI 성공을 확인한다.
- [x] S006b EXPO_TOKEN을 설정하고 testflight runtime 1.0.1 OTA 게시를 확인한다.
- [ ] S006c fork PR CI와 main 필수 검사·직접 push 제한 설정을 검증한다.
- [x] S007 GitHub macOS 수동 빌드·IPA artifact·지정 IPA 제출 workflow를 연결한다. 실제 실행 검증은 S008로 분리한다.
- [x] S008a GitHub macOS에서 서명·로컬 빌드·IPA 보관과 지정 IPA 제출을 검증한다. 앱 1.0.1 / 빌드 20.
- [x] S008b 사용자의 TestFlight 1.0.1 사용 가능 메일 수신을 확인한다.
- [ ] S008c 실기기 설치·실행·로그인과 동일 runtime OTA 실제 수신을 확인한다.
- [ ] S008d 다른 runtime 설치본의 OTA 미수신을 검증한다.
- [ ] S008e 별도 테스트 일정에 rollback과 자동 OTA 재개를 검증한다. 정상 배포를 지금 되돌리지 않는다.

실제 외부 실행·계정 설정과 미검증 동작은 완료로 표시하지 않는다. 다음 리뷰 단계는 사용자 확인 후 진행한다.

## Turbo 영향 판정 후속 작업

- [x] T001 모바일 영향 시에만 게시하고 판정 불가 시 게시하는 정책을 명세·계획에 반영한다.
- [x] T002 EAS 마지막 게시 조회·Turbo 판정·루트 공통 입력·Summary를 연결한다.
- [x] T003 실제 Turbo와 workflow shell의 회귀 테스트를 추가한다.
- [ ] T004 사용자 리뷰 후 원격 PR CI와 main 게시·생략 동작을 검증한다.
