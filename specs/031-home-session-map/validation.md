# 검증 기록

## 1단계 — 명세와 계획

- 2026-11-28: 사용자 승인 계획을 명세·계약·조사·작업 목록·검증 안내에 반영했다.
- 실제 브랜치는 `DongjaJ/dongjaj/keep-current-implementation`이며 변경하지 않았다.
- HEAD는 `d6f5cf4d`, 조사한 origin/main은 `e2149d3a`다. 제품 코드는 수정하지 않았다.
- 열린 이슈 “홈·카카오·지도” 검색 결과 동일 목적은 없었다. 이슈 초안은 생성 승인 전이다.
- Spec Kit 기본 템플릿을 사용했고 확장 훅 설정은 없다. feature 선택만 로컬 상태에 기록했다.
- 문서 품질 체크리스트 검토 완료. Spec Kit prerequisites가 모든 설계 문서·작업 목록을 인식했다.
- `node --run check` 통과: format 검사는 새 실행, lint·typecheck·test는 Turbo 캐시 재사용이다.
  기존 캐시의 테스트를 이번 작업에서 새로 실행한 것으로 간주하지 않는다.
- 최초 문서 링크 검사 스크립트가 formatter의 `<https:...>` 표기를 상대 경로로 오인했다.
  검사기에서 외부 링크를 올바르게 구분한 뒤 문서 링크·작업 ID·미확정 표시 검사를 다시 통과했다.
- 패키지 실행 과정에서 pnpm이 lockfile 그대로 로컬 저장소의 의존성을 복원했다. manifest·lockfile 변경은 없다.
- build·브라우저 화면·iPhone 설치/미설치·VoiceOver는 제품 구현 전이므로 미실행이다.
- 이후 사용자가 1단계 커밋·다음 단계 진행 및 이슈 생성·main 병합을 승인했다.

## 2단계 — 모바일 외부 지도 실행

- 이슈 [#665](https://github.com/YAPP-admin/yapp-plus-frontend/issues/665)를 담당자 DongjaJ로 생성하고 본문·상태를 재조회했다.
  GitHub 연결 도구의 403 오류 뒤 승인된 동일 작업을 로컬 gh로 완료했다.
- 1단계 문서 커밋은 `037f96cf`, main 병합 커밋은 `7c0cd07d`다. 충돌 없이 병합했고 브랜치를 유지했다.
- 지정된 카카오 HTTPS 좌표 URL을 앱 스킴으로 변환하고 실행 실패 시 원본 URL을 연다.
  일반 외부 링크는 원래 동작을 유지하며 최종 실패만 Alert로 안내한다.
- 같은 URL이 실행 중일 때만 중복을 막고, 앱·웹 성공/실패 뒤 잠금을 해제한다.
- 기존 trusted origin 탐색·`allowsLinkPreview={false}`·홈 스켈레톤 변경을 보존했다.
- 테스트를 먼저 작성했으며 구현 파일이 없어 최초 실행은 모듈 로드 단계에서 실패했다.
  구현 후 지도 실행 테스트 35개가 새 실행으로 통과했다.
- 첫 check는 새 코드의 중괄호 규칙 4건으로 실패해 수정했다. 최종 `node --run check`는 통과했다.
  format 및 모바일 lint·typecheck·26개 파일의 테스트 373개는 새 실행이다.
  나머지 lint 6개·typecheck 6개·test 4개 작업은 Turbo 캐시를 재사용했다.
- `node --run build`는 3개 작업 모두 Turbo 캐시로 통과했다. 이 명령은 iOS 바이너리 빌드가 아니다.
- 앱 설정·의존성을 변경하지 않아 expo:doctor는 실행하지 않았다.
- iPhone의 카카오맵 설치/미설치·앱 복귀·실제 Alert는 미검증이다. 모의 OS 실행 테스트로 대체하지 않는다.
- 3단계 홈 UI·지도 링크는 아직 구현하지 않았다. 2단계 리뷰 후 진행한다.
