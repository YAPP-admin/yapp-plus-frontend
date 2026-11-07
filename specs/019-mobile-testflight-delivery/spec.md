# 기능 명세: main 자동 OTA와 수동 iOS 로컬 빌드

**이슈**: [#367](https://github.com/YAPP-admin/yapp-plus-frontend/issues/367)
**상태**: 사용자가 appVersion 유지·main 자동 OTA·수동 로컬 빌드·PR 버전 누락 검사를 승인했다.
이 명세는 이전의 자동 빌드 분기·기준 파일 PR 활성화 정책을 대체한다.

## 사용자 시나리오

1. 개발자가 호환되는 JS 변경을 main에 병합하면 CI 성공 후 TestFlight 채널에 OTA가 게시된다.
2. 네이티브 변경에는 앱 버전 증가가 필요하다. 누락하거나 버전을 낮추면 PR 검사가 실패한다.
3. 새 버전의 IPA는 운영자가 GitHub macOS에서 공식 local build를 수동 실행하고 지정 IPA를 제출한다.
4. 새 runtime OTA는 새 빌드 설치 전에도 게시할 수 있다. 기존 runtime 앱은 이를 받지 않는다.
5. 문제가 있으면 자동 workflow를 중지하고 공식 rollback으로 복구한 뒤 명시적으로 재개한다.

## 요구사항과 검증 기준

- **FR-001**: 동일 저장소 main push의 성공 CI가 검증한 SHA만 게시한다. 오래된 CI 결과는 제외한다.
- **FR-002**: main에서는 변경 영향·빌드 존재·설치 여부로 분기하지 않고 매번 iOS OTA를 게시한다.
- **FR-003**: appVersion 정책을 유지한다. PR의 네이티브 변경 시 버전 증가를 요구하고 감소를 거부한다.
- **FR-004**: Expo Fingerprint와 제외된 빌드 입력의 digest를 사용한다. 수집 불완전·OS 불일치는 실패한다.
- **FR-005**: 빌드·제출은 수동이다. 클라우드 빌드, 자동 IPA 재사용·활성화 상태 관리를 추가하지 않는다.
- **FR-006**: 채널은 testflight, 플랫폼은 ios, OTA 환경은 production이다. 공개 WebView URL을 일치시킨다.
- **FR-007**: 실행을 직렬화하고 게시 직전 최신 main을 재확인한다. 메시지에 소스 SHA·실행 ID를 남긴다.
- **FR-008**: 자동 멱등성·외부 결과 복구를 구현하지 않는다. 실패 후 재실행 전에 EAS 결과를 수동 확인한다.
- **FR-009**: 복구 전에 자동 게시를 비활성화하고 실행·대기 작업 종료를 확인한다. 복구 후 명시적으로 재개한다.
- **FR-010**: PR 검사에 배포 비밀을 전달하지 않고 외부 Action과 CLI를 고정한다.

**SC-001**: JS 변경·버전 증가·감소·네이티브 변경의 PR 검사 사례를 검증한다.
**SC-002**: 실패·PR CI·오래된 main을 게시하지 않으며 정상 main의 게시를 SHA로 추적할 수 있다.
**SC-003**: 로컬 빌드·TestFlight 설치·동일 runtime OTA·다른 runtime 미수신·복구를 실기기로 확인한다.

## 범위와 도입 단계

PR 검사·자동 OTA 코드는 acccd4c8에 기록했다. 현재 리뷰는 GitHub macOS 수동 빌드와 지정 IPA 제출이다.
실제 게시·원격 CI·서명 검증은 아직 실행하지 않았다. 로컬 명령과 복구 절차는 앱 README에 기록한다.
설치 확인은 운영 점검으로 남지만 OTA 게시의 승인 조건은 아니다. 기준 파일·자동 버전별 상태 관리는 제거한다.
Android·App Store 공개 배포·PR Preview는 후속 범위다. PR Preview 도입 시 공식 preview Action을 사용한다.
