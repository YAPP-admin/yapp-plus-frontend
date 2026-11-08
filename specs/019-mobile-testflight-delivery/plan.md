# 구현 계획: main 자동 OTA와 수동 로컬 빌드

**이슈**: [#367](https://github.com/YAPP-admin/yapp-plus-frontend/issues/367) | **명세**: [spec.md](spec.md)
**적용 상태**: PR #374–#377 및 설치 오류 수정 #380 main 병합 완료. 검증 소스 `3b7ca130`.

전체 연결 관계와 구현 상태는 [배포 시각화](overview.md)를 참고한다.

## 현재 구현

- PR의 base 브랜치 필터를 두지 않아 종속 PR도 검사한다. push CI는 main에만 실행한다.
- 모든 PR에서 네이티브 검사를 실행한다. Turbo affected·경로 필터·Verify 완료 대기 조건은 사용하지 않는다.
- Expo Doctor도 CI마다 실행하며 경로 필터용 pull-requests 권한은 제거한다.
- 비밀 없는 Linux/macOS job이 base/merge의 공식 Expo 지문을 직접 계산한다. 이전 지문 캐시에 의존하지 않는다.
- 지문 수집과 앱 버전 규칙 두 파일만 유지한다. 별도 상태 머신·기준 파일·배포 래퍼를 만들지 않는다.
- base의 검사 코드를 사용하며 최초 도입만 후보 코드의 리뷰가 필요하다. 수집 실패는 호환으로 해석하지 않는다.
- build·cli·root package·workspace·도구·patch 입력은 보수적으로 digest에 포함한다. submit 전용 변경은 제외한다.
- main: 성공 CI 출처·최신 SHA를 확인하고 공통 setup-eas Action에서 pnpm으로 고정 EAS CLI를 준비해 `eas update`를 실행한다.
- main 배포에는 Turbo skip·빌드 조회·설치 승인·마지막 반영 SHA 조회가 없다. 문서 변경도 OTA를 게시한다.
- 동일 SHA 재실행의 중복 게시 가능성을 허용한다. 불명확한 결과는 운영자가 EAS 대시보드에서 확인한다.

## 고정 도구와 권한

Node 24.20.0, pnpm 12.3.4, EAS CLI 27.4.1과 Action commit SHA를 사용한다.
PR job에는 배포 비밀을 전달하지 않고 OTA·빌드·제출 명령 단계에만 EXPO_TOKEN을 제공한다.
CLI 설치 작업 공간에는 dtrace-provider@0.8.8과 protobufjs@7.6.6의 설치 스크립트 차단을 명시한다.
CI의 Mobile native compatibility를 필수 검사로 설정하고 main 직접 push를 제한하는 운영 설정이 필요하다.

## 다음 단계와 복구

원격 CI·자동 OTA 게시·macOS 서명 빌드·지정 IPA 제출은 성공했다. 사용자가 TestFlight 사용 가능 메일 수신을 확인했다.
실기기 설치·OTA 수신, 다른 runtime 미수신, fork CI와 필수 검사 설정 확인은 남아 있다.
Rollback은 후속 테스트로 남긴다. 테스트 일정·대상 runtime·복구할 업데이트 또는 내장 코드와 영향받는 테스터를 정하고 별도 실행 승인을 받은 뒤 검증한다.
복구는 자동 workflow 비활성화 → 실행·대기 종료 → 공식 rollback → 확인 → 명시적 재개 순서다.
명령과 운영 절차는 [모바일 README](../../apps/mobile/README.md)에 둔다.

## 헌법 점검

사용자가 설치 확인 게이트와 자동 빌드 분기를 제거하는 정책 변경을 승인했다. 로컬 빌드와 appVersion은 유지한다.
기본 check·build·expo:doctor를 실행하고 캐시와 새 실행을 구분한다. 각 리뷰는 800줄 미만으로 분리한다.

## 수동 빌드·제출 구현

mobile-manual.yml 하나에서 build/submit을 수동 선택한다. workflow는 main에서만 실행한다.
build는 실행 시 main SHA에 성공한 push CI가 있는지 GitHub API로 확인하고 공식 local build를 호출한다.
표준 macos-26 runner에서 Xcode 26.6, Ruby 3.4.12, CocoaPods 1.17.0, fastlane 2.241.2를 확인한다.
2026-11-08 실제 빌드에서 해당 도구 검사와 서명을 통과했다. 이후 runner 이미지 변경 시 다시 검증한다.
IPA와 SHA-256 파일만 공식 artifact Action으로 30일 보관한다. 이름에는 실행 회차를 넣어 덮어쓰지 않는다.
submit은 build_run_id와 build_attempt를 받아 해당 회차의 성공·main·workflow 출처를 확인한다.
공식 download-artifact로 지정 IPA를 받고 checksum을 대조한 뒤 빌드 소스의 testflight 제출 프로필로 submit --path를 실행한다.
자동 OTA와 같은 concurrency 그룹을 사용한다. 별도 JS·배포 상태 파일·빌드 검색 시스템은 만들지 않는다.
Expo의 원격 서명 자격 증명·원격 build number·제출 API 키를 사전에 준비해야 한다.
실패 시 자동 재시도하지 않고 Actions·EAS·App Store Connect 결과를 확인한 뒤 운영자가 재실행한다.
