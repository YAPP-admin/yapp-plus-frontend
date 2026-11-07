> **이전 설계 기록 — 현재 정책 아님.** 자동 빌드·활성화 기준 설계는 폐기됐다. 현재 요구사항은 [../spec.md](../spec.md), 실행 절차는 모바일 README를 따른다. 아래 내용과 완료 표시는 이전 설계의 이력이다.

# 공식 CLI 호출과 프로젝트 경계

**고정 버전**: EAS CLI `27.4.1`. 명령은 후속 workflow 구현 계약이며 이번 단계에서 배포를 실행하지 않는다.

## 기본 명령

```sh
eas config --platform ios --profile testflight --json
eas fingerprint:generate --platform ios --build-profile testflight --json
eas build --local --platform ios --profile testflight --non-interactive --output app.ipa
eas submit --platform ios --profile testflight --path app.ipa --non-interactive
eas update --platform ios --channel testflight --environment production --message "$MESSAGE" --non-interactive --json
```

config는 인증된 읽기 조회다. fingerprint CLI는 계산 후 서버 등록도 수행한다. PR·report-only에서는 공식 로컬 Fingerprint API를 사용한다.
config의 원시 JSON·env를 로그나 artifact로 남기지 않고 필요한 공개 필드만 추출한다.
`--build-profile`과 `--environment`는 fingerprint CLI에서 함께 전달하지 않는다.
`eas.json`의 testflight 프로필에 environment=production을 명시하는 변경은 빌드 도입 단계에서 적용한다.

## 조회·복구

```sh
eas update:list --branch testflight --platform ios --runtime-version "$RUNTIME" --json --non-interactive
eas update:view "$GROUP_ID" --json
eas update:republish --group "$GOOD_GROUP_ID" --platform ios --non-interactive --json
eas update:roll-back-to-embedded --channel testflight --runtime-version "$RUNTIME" --platform ios --non-interactive --json
```

게시 전 실제 채널의 branch 연결을 조회한다. 위 testflight branch 예시는 현재 연결이며 연결을 자동 수정하지 않는다.
정상 group 재게시는 같은 프로젝트·branch·iOS·runtime만 허용한다. 복구 전에 자동 workflow 게시를 정지한다.
`eas channel:pause`는 단말로의 update 전달 중지이므로 CI의 자동 게시 정지와 동일하게 취급하지 않는다.

## 프로젝트 검증

- 입력 SHA·runtime·ID는 신뢰 경계에서 검증하고 shell 코드에 직접 삽입하지 않는다.
- 환경은 production, 채널/프로필은 testflight, 플랫폼은 ios다. 빌드·검사·OTA의 공개 WebView URL을 일치시킨다.
- native 구성 비교는 앱 버전·자동 증가 buildNumber·submit 전용 필드를 분리하고 동일 입력을 동일하게 정규화한다.
- native 변경 시 버전 증가, main 성공 CI, 최신성, 설치 확인된 기준 일치를 프로젝트 규칙으로 검사한다.
- Summary는 SHA·판정·이유·runtime·IPA/Update 링크·다음 수동 작업만 표시한다.
- report-only에서는 외부 변경을 호출하지 않는다. mode·활성 기준은 apps/mobile/delivery.json으로 관리하며 [상태 모델](../data-model.md)의 승인·보관·복구 계약을 따른다.

## 기준 파일 PR 검증

mode=active에는 완전한 active 기준이 필요하다. runtime은 세 자리 앱 버전, fingerprint/buildSha는 40자리 hex, nativeBuildDigest/ipaSha256은 64자리 hex다.
buildRunId/artifactId는 양의 안전한 정수, verificationUrl은 자격 증명이 없는 HTTPS 증거 링크다.
알 수 없는 필드·잘못된 값·이전 runtime·현재 설치 기준 삭제를 거부한다. 동일 runtime의 다른 native 키도 거부한다.
초기 JSON은 report-only·active=null이다. 실제 build/submit/설치 검증 전에는 예시 값을 활성 기준으로 넣지 않는다.
