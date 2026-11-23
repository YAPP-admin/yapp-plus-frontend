# 검증·전환 실행 안내

이 문서는 후속 구현을 검증할 절차다. 현재 실행 결과는 [validation.md](validation.md)를 확인한다.
제품 기능 구현 전에 [계획](plan.md)의 단계 리뷰와 [계약](contracts/delivery.md)을 적용한다.

## 1. 로컬 문서·기본 품질 확인

저장소 루트에서 고정 Node.js·pnpm을 사용한다. 이미 존재하는 사용자 파일이나 도구 신뢰 설정을 바꾸지 않는다.

```sh
pnpm install --frozen-lockfile --ignore-scripts
bash .specify/scripts/bash/check-prerequisites.sh --json --require-spec --require-tasks --include-tasks
node --run check
```

설치는 문서 검증용으로 lifecycle을 실행하지 않는다. 실제 제품 빌드는 저장소의 필요한 설치 절차를 따른다.
배포 앱·빌드 설정을 변경한 단계는 `node --run build`, 모바일 설정 변경은 `node --run expo:doctor`와
기존 CI 네이티브 검사를 추가한다. 실행 로그에서 cache hit와 새 실행을 구분한다.
외부 API를 호출하지 않는 CI 빌드에는 `VITE_API_BASE_URL=https://example.invalid`처럼 예약된 비실재
HTTPS URL을 공급한다.

## 2. 외부 준비 확인

값 전체를 출력하지 않고 프로젝트·환경·공개 ID의 일치 여부만 기록한다.

- Doppler dev/prd → Vercel Preview/Production sync와 branch override를 확인한다.
- 첫 검증된 개발 Preview에서 `yapp-plus-web-dev.vercel.app` alias의 가용성·HTTPS·WebView 접근을
  확인하고 운영 자동 domain/branch alias와 분리한다.
- API origin 허용, OAuth audience, Firebase 프로젝트·Bundle ID·APNs 연결을 확인한다.
- GitHub member-development/member-production과 EAS preview/production의 공급 입력을 맞춘다.
- 기존 자동 배포와 정상 웹 ID·OTA group/runtime·IPA 출처를 복구 기준으로 기록한다.

## 3. 자동화 회귀 시나리오

외부 CLI를 대체한 테스트로 판정과 실행 경로를 확인한다. Vercel·EAS 자체 구현을 테스트하지 않는다.

| 입력/상황                           | 기대 결과                                           |
| ----------------------------------- | --------------------------------------------------- |
| 웹만 / 모바일만 / 공용 변경         | 각각 웹 / 모바일 / 실제 의존 대상 선택              |
| 최초 성공 기록 없음                 | 해당 대상 전체 배포                                 |
| 이전 웹 실패 후 문서 커밋           | 이전 성공 이후 미반영 웹 변경 재선택                |
| 개발 조회 실패 / 운영 조회 실패     | 개발 영향 있음 처리 / 운영 실패·수동 확인           |
| prerelease·main 밖·CI 미성공 SHA    | 운영 배포 거절                                      |
| 이전 성공 SHA보다 오래된 후보·force | 일반 실행 거절, force로도 우회 불가                 |
| 자동·수동 실행 순서 역전            | 같은 환경 잠금과 최신성 검사로 구버전 덮어쓰기 방지 |
| Doppler 설정만 변경·동일 SHA 재배포 | 새 입력으로 재빌드, 다른 환경은 불변                |
| 웹 성공·OTA 실패                    | 결과 분리, 미완료 OTA를 후속 실행에서 다시 선택     |
| alias 실패·결과 기록 실패           | 전체 성공으로 표시하지 않고 외부 결과 대조          |

## 4. 단계별 전환과 실기기

1. 모바일 설정 전환 전에 기존 모바일 자동 게시를 중지한다. 웹 트리거 전환 전에는 회원 웹 자동 운영 배포도
   중지한다. 실행·대기를 확인하며 관리자 workflow 전체를 중지하지 않는다.
2. 검증된 main으로 개발 웹·OTA를 배포하고 새 QA IPA를 수동 생성·제출한다.
3. 로그인·로그아웃·세션 복구·알림 ON/OFF·포그라운드/백그라운드/종료 push를 실제 기기로 확인한다.
4. 같은 runtime의 QA OTA 적용과 다른 runtime 미수신, 운영 채널 OTA 미수신을 확인한다.
5. 확인한 SHA의 정식 태그로 운영 웹·OTA를 배포한다. 전후 개발 alias ID가 바뀌지 않아야 한다.
6. 같은 태그의 production IPA를 별도 생성·제출하여 TestFlight에서 운영 연결을 확인한다.
7. QA↔운영 설치 전환 시 환경 없는 구형 세션으로 갱신 요청하지 않는지 확인한다.
8. 기존 runtime 앱에서 운영 웹 브리지가 동작하는지 확인한다. 새 runtime OTA 게시를 설치 완료로 보고하지 않는다.
9. 정식 심사·출시는 수동 진행한다. 이후 개발 자동 배포 재개와 다음 main 변경의 운영 불변을 확인한다.

## 5. 복구와 기록

자동 배포 중지·대기 종료 → 정상 웹 배포 또는 동일 환경/runtime OTA 복구 → 실제 동작 확인 →
복구 산출물 source SHA 기록 → 명시적 재개 순서다. native 오류는 수정 IPA가 필요하다.
이슈와 연결된 validation에 환경·SHA·tag·run/attempt·배포 ID·runtime·실기기 관찰·미검증 항목을 남긴다.
자동화 검증·시뮬레이터·TestFlight 업로드 성공을 실기기 성공이나 정식 출시로 대체하지 않는다.
