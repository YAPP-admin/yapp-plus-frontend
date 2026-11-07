# 구현 계획: main 자동 OTA와 수동 로컬 빌드

**이슈**: [#367](https://github.com/YAPP-admin/yapp-plus-frontend/issues/367) | **명세**: [spec.md](spec.md)
**브랜치**: `DongjaJ/mobile-delivery-report` | **예정 base**: `DongjaJ/mobile-delivery-policy`

## 현재 구현

- 모든 PR에서 네이티브 검사를 실행한다. Turbo affected·경로 필터·Verify 완료 대기 조건은 사용하지 않는다.
- Expo Doctor도 CI마다 실행하며 경로 필터용 pull-requests 권한은 제거한다.
- 비밀 없는 Linux/macOS job이 base/merge의 공식 Expo 지문을 직접 계산한다. 이전 지문 캐시에 의존하지 않는다.
- 지문 수집과 앱 버전 규칙 두 파일만 유지한다. 별도 상태 머신·기준 파일·배포 래퍼를 만들지 않는다.
- base의 검사 코드를 사용하며 최초 도입만 후보 코드의 리뷰가 필요하다. 수집 실패는 호환으로 해석하지 않는다.
- build·cli·root package·workspace·도구·patch 입력은 보수적으로 digest에 포함한다. submit 전용 변경은 제외한다.
- main: 성공 CI 출처·최신 SHA를 확인하고 공식 Expo Action으로 EAS CLI를 준비해 `eas update`를 실행한다.
- main 배포에는 Turbo skip·빌드 조회·설치 승인·마지막 반영 SHA 조회가 없다. 문서 변경도 OTA를 게시한다.
- 동일 SHA 재실행의 중복 게시 가능성을 허용한다. 불명확한 결과는 운영자가 EAS 대시보드에서 확인한다.

## 고정 도구와 권한

Node 24.20.0, pnpm 12.3.4, EAS CLI 27.4.1과 Action commit SHA를 사용한다.
PR job에는 배포 비밀을 전달하지 않고 자동 OTA job에만 EXPO_TOKEN을 제공한다.
CI의 Mobile native compatibility를 필수 검사로 설정하고 main 직접 push를 제한하는 운영 설정이 필요하다.

## 다음 단계와 복구

현재 코드 리뷰 후 원격 CI·실제 OTA를 검증한다. 그 다음 GitHub macOS 수동 local build·IPA 제출을 연결한다.
Xcode·CocoaPods·fastlane·서명 준비는 실제 runner에서 검증하며 확인 전 준비 완료로 표시하지 않는다.
복구는 자동 workflow 비활성화 → 실행·대기 종료 → 공식 rollback → 확인 → 명시적 재개 순서다.
명령과 운영 절차는 [모바일 README](../../apps/mobile/README.md)에 둔다.

## 헌법 점검

사용자가 설치 확인 게이트와 자동 빌드 분기를 제거하는 정책 변경을 승인했다. 로컬 빌드와 appVersion은 유지한다.
기본 check·build·expo:doctor를 실행하고 캐시와 새 실행을 구분한다. 각 리뷰는 800줄 미만으로 분리한다.
