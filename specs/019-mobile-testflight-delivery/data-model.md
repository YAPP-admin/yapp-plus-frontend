# 필요한 배포 사실과 출처

**상태**: 공식 CLI 중심 축소안. 기존 범용 GitHub Deployments ledger 설계를 대체한다.

## 도구가 이미 관리하는 사실

| 사실           | 출처                                 | 주의점                                                     |
| -------------- | ------------------------------------ | ---------------------------------------------------------- |
| 검증된 소스    | GitHub main push CI 실행·commit SHA  | PR 실행이나 오래된 main 성공을 최신 후보로 쓰지 않는다     |
| 로컬 IPA       | Actions 실행과 artifact              | EAS cloud build ID가 없으므로 get-build로 찾지 않는다      |
| OTA 결과       | EAS Update group·runtime·게시 메시지 | 메시지에 소스 SHA와 작업 식별자를 넣고 공식 CLI로 조회한다 |
| 실행 성공·실패 | GitHub Actions 결과와 로그           | 외부 게시 성공 뒤 job 실패 가능성을 구분한다               |

## 직접 연결해야 하는 최소 사실

- IPA: source SHA, runtime, fingerprint, native 빌드 구성 digest, 실행/artifact ID, IPA digest, bundle ID·채널·build number.
- 활성 기준: 설치 확인한 IPA의 메타데이터와 확인 증거. 빌드·제출 성공만으로 활성화하지 않는다.
- 마지막 반영 소스: 같은 runtime의 활성 빌드 SHA 또는 이후 확인된 OTA/rollback 소스 SHA.
- 운영 중지 여부: 복구 중 자동 게시를 막으며 명시적 재개 전까지 유지한다.

별도 initialization/operation/result 이벤트 종류와 이력 재생 코드를 만들지 않는다.
IPA 메타데이터는 산출물과 함께 보관하고, 활성 기준은 IPA 보관 기한과 독립적으로 유지해야 한다.

## 활성화 기준 파일 — 확정

`apps/mobile/delivery.json`을 Git으로 관리한다. `schemaVersion: 1`, `mode`, `active`를 가진다.
mode는 report-only/build-only/active/paused다. 최초값은 report-only·active=null이며 실제 설치 전 기준을 만들지 않는다.
active는 runtime, fingerprint, nativeBuildDigest, buildSha, buildRunId, artifactId, ipaSha256, verificationUrl을 가진다.
SHA·digest·ID 형식을 검사하고 활성화 PR에서 원본 실행·IPA 메타데이터·성공한 main CI와 대조한다. 형식 통과만으로 설치 사실을 증명하지 않는다.
실기기 로그인·WebView·위치 확인 후 active를 등록하고 mode=active로 바꾼 PR을 병합한다. 병합된 main의 CI 성공 후 최신 소스를 재평가한다.
새 기준은 이전 runtime보다 커야 한다. 같은 runtime의 재확인은 같은 native 키·빌드 출처일 때만 허용하고 기준 삭제·감소를 거부한다.
기준 JSON은 artifact 만료 후에도 유지된다. 삭제나 손상을 최초 도입으로 처리하지 않도록 Git 이력과 대조한다.

## 대기 IPA와 보관

IPA와 비밀 없는 메타데이터를 분리한 Actions artifact로 보관한다. IPA는 30일, 메타데이터는 저장소가 허용하는 최대 기간으로 설정한다.
대기 IPA는 성공한 승인 workflow의 실행·동일 runtime·native 키로 찾는다. 기록 조회는 GitHub CLI/API를 사용한다.
IPA만 만료되면 확인 가능한 메타데이터로 재빌드한다. 기준 메타데이터도 없으면 자동 처리를 중단하고 증거 복구 또는 새 runtime을 요구한다.
새 runtime 생성 이후 같은 runtime의 다른 native 키가 발견되면 버전 증가 누락으로 거부한다.

## 중지와 재개

일상 중지는 기준 파일의 mode=paused를 PR로 반영한다. 긴급 복구는 자동 workflow를 먼저 비활성화하고 대기·실행 작업을 취소한 뒤 종료를 확인한다.
별도 수동 workflow에서 공식 CLI로 복구하고 성공 여부와 실제 반영 SHA를 확인한다. 자동 workflow 비활성 상태는 명시적으로 재활성화할 때까지 유지한다.
수정된 최신 main·CI·호환성을 확인한 뒤 mode=active PR과 명시적 workflow 재활성화로 재개하고 최신 main을 재평가한다.
단말 update 전달을 막는 channel:pause를 자동 게시 중지의 대체물로 쓰지 않는다.

## 반드시 보존할 실패 처리

- 최초 도입과 조회 실패·기존 기록 소실을 구분하며 확인되지 않은 기준으로 OTA를 게시하지 않는다.
- 동일 runtime의 다른 native 구성은 거부한다. 대기 IPA가 만료돼도 이 제약을 잃지 않는 보관 방식을 구현 전에 검증한다.
- 활성 기준이 없는 새 runtime은 OTA를 기다린다. 구버전 runtime으로 최신 소스를 대신 게시하지 않는다.
- 외부 작업의 결과가 불명확하면 재실행하지 않는다. 결과 존재와 미실행을 구분한 뒤 수동으로 재개한다.
- rollback 후 실제 복구 소스를 누적 비교 기준으로 삼고, 문제 OTA를 자동 재게시하지 않는다.

외부 게시 결과는 소스 SHA·runtime을 담은 메시지와 공식 조회로 확인한다. 이전 실행이 불명확하면 자동 재게시하지 않고 수동 확인 뒤 재개한다.
