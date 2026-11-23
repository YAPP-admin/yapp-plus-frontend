# 환경과 배포 실행 계약

이 계약은 승인된 목표 동작이다. 현재 배포 설정이 적용됐다는 뜻이 아니다.

## 환경 입력

| 입력                                        | 개발·QA                 | 운영                    | 공급 원본                                          |
| ------------------------------------------- | ----------------------- | ----------------------- | -------------------------------------------------- |
| 웹 API                                      | 개발 API                | 운영 API                | Doppler yapp-plus-web dev/prd의 VITE_API_BASE_URL  |
| 웹 배포                                     | Preview                 | Production              | Doppler→Vercel sync 후 vercel pull                 |
| APP_ENV                                     | development             | production              | EAS preview/production                             |
| MOBILE_WEB_URL                              | 개발 고정 URL           | 기존 운영 URL           | EAS preview/production                             |
| MOBILE_API_BASE_URL                         | 개발 API                | 운영 API                | EAS preview/production                             |
| GOOGLE_IOS_CLIENT_ID / GOOGLE_WEB_CLIENT_ID | 개발 서버가 허용한 ID   | 운영 서버가 허용한 ID   | EAS preview/production                             |
| 프로필·채널                                 | testflight / testflight | production / production | eas.json과 workflow                                |
| FIREBASE_IOS_GOOGLE_SERVICES_PLIST          | 개발 Firebase           | 운영 Firebase           | GitHub member-development/member-production Secret |
| APNS_ENVIRONMENT                            | production              | production              | 스토어 배포 프로필                                 |

- development·development-simulator는 로컬 dev client로 유지한다. 로컬 앱도 검증된 개발 API를 사용한다.
- 모바일 공개 설정은 빌드·OTA에서 같은 EAS 환경을 읽는다. OTA에 build profile의 env가 자동으로
  적용된다고 가정하지 않는다. APP_ENV·URL은 Expo extra로 전달하고 첫 API 요청 전에 검증한다.
- 배포 URL은 HTTPS·비어 있지 않음·credentials 없음으로 검증한다. 배포 설정 오류에 운영 fallback은 없다.
- OAuth iOS URL scheme은 환경의 client ID와 맞춘다. 네이티브 설정·plist 변경은 새 appVersion/IPA가 필요하다.
- Firebase 원본은 임시 파일로 복원하고 경로 변수 FIREBASE_IOS_GOOGLE_SERVICES_FILE로 전달한다.
  plist 누락·구문 오류·Bundle ID·기대 Firebase 프로젝트 불일치는 build 전에 실패한다.
- local build가 EAS secret file을 자동으로 내려받는다고 가정하지 않는다. 필수 plist 검사는 IPA 생성에
  적용하며 OTA config 평가에 파일을 강제하지 않는다. 기존 local toolchain 검증을 유지한다.
- PR의 양 OS 네이티브 검사는 비밀 없이 동일한 공개 fixture 입력으로 수행한다. 검사 누락으로 통과시키지 않는다.
  외부 Firebase·OAuth 네이티브 설정만 바뀌어도 앱 버전 증가 PR과 새 IPA를 요구한다.

## 웹 URL과 설정 전달

개발 고정 URL은 `yapp-plus-web-dev.vercel.app` 전용 alias를 확보해 `WEB_DEVELOPMENT_HOST`에
등록한다. 이 alias는 임의 Preview에 수동 연결하지 않는다. 자동 main branch alias와 운영 기본 domain을
개발 주소로 겸용하지 않는다. 개발 workflow만 Preview READY·최신 SHA 확인 후 이 alias를 이동한다.
실제 alias의 deployment ID 확인까지 성공해야 배포 성공이다. PR·운영은 이 alias를 갱신하지 않는다.
운영 태그 출처와 개발 main 출처를 구분하고 detached checkout의 Git metadata를 명시한다.
개발 alias가 Vercel 인증 화면 없이 QA WebView에서 열리는지 확인하고 앱에 bypass secret을 넣지 않는다.

Doppler dev→Preview, prd→Production으로 각각 sync한다. VITE_API_BASE_URL은 공개 설정이므로
Unmasked/Config로 공급하고 기존 branch override가 이를 덮지 않는지 확인한다.
운영은 운영 설정으로 재빌드한다. 설정만 변경하면 수동 force 재배포하며 CI와 캐시에 같은 값을 공급한다.
Vercel Git 자동 배포와 sync 후 자동 redeploy는 태그·CI 검증을 우회하지 않게 비활성화한다.

## 출처와 수동 입력

- 개발 자동: 같은 저장소 main push의 CI 성공, 실제 workflow 경로 확인, 게시 직전 최신 main 재확인.
- 운영 자동: glob 외에 `^release-v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$`로 검사한다.
  tag를 commit으로 peel하고 main 조상 관계·같은 SHA의 ci.yml push 성공을 검증한다. 태그 이동은 허용하지 않는다.
- 웹 수동: app(web/admin/all), environment(preview/production), release_tag, force 입력을 사용한다.
  web/all의 production은 release_tag 필수, admin 부분은 기존 검증 main 정책을 유지한다.
- 모바일 수동: environment(development/production), operation(build/submit), source_sha 또는 release_tag,
  기존 build_run_id/build_attempt를 받는다. 개발 build는 검증 main SHA, 운영 build는 정식 tag SHA다.
  submit은 선택한 성공 artifact의 환경과 소스를 사용하고 임의 입력으로 바꾸지 않는다.
- workflow는 검증된 SHA를 checkout한다. 입력은 환경 변수로 전달하고 shell 코드에 직접 삽입하지 않는다.
- 배포 secret은 검증 후 필요한 job/step에만 제공한다. 읽기 권한을 기본으로 하고 결과 기록 job에만 deployments: write를 추가한다.

## 영향 판정·동시 실행

웹은 대상 환경의 최신 성공 Deployment에서 source SHA를 읽고 Turbo build 영향을 계산한다.
모바일은 실제 EAS 채널→branch 연결을 확인하고 마지막 iOS 게시를 공식 list/view로 읽어 기존 Turbo 패키지 판정을 사용한다.
첫 기록 없음은 전체 배포, 설정 변경·force는 해당 대상 배포다. 각 대상은 자신의 성공 기준을 사용한다.
기준 SHA가 후보의 조상이 아니면 일반 배포를 거절한다. force도 출처·최신성·환경 검사를 우회하지 않는다.

개발의 조회/영향 오류는 기존처럼 배포 대상으로 처리하되 최신 main 확인 실패는 중단한다.
운영의 조회/영향 오류·rollback-to-embedded로 기준 SHA를 정할 수 없는 상태는 중단하고 수동 확인한다.
최초 배포인지 조회 실패인지 구분한다. 정상 update 재게시로 기준을 회복한 뒤 다시 진행한다.

자동·수동은 member-web-development, member-web-production, member-mobile-development,
member-mobile-production 그룹을 공유하고 cancel-in-progress=false를 사용한다. 잠금 범위는
최종 기준 조회부터 외부 배포·기록까지다. GitHub concurrency를 FIFO 작업 큐로 간주하지 않는다.
운영은 최신 성공 SHA와 같거나 그 후손인 후보만 허용하며 웹·OTA 결과는 독립적으로 기록한다.

## runtime과 복구

appVersion을 유지한다. 네이티브 변경 PR마다 기존 검사를 통과해야 하며 build number만 올려 대체하지 않는다.
새 runtime OTA는 게시 가능하지만 호환 IPA 전까지 전달 대기다. QA OTA를 운영으로 단순 republish하지 않는다.
같은 소스도 환경별로 다시 export하며 기존 설치본과 웹 브리지 호환성을 확인한다.

복구 전 해당 자동 workflow를 중지하고 실행/대기 종료를 확인한다. 웹은 이전 정상 Production 배포,
OTA는 동일 환경·iOS·runtime의 정상 group 재게시 또는 embedded 복구, native는 수정 IPA를 사용한다.
웹 복구 기록의 SHA는 rollback workflow의 HEAD가 아니라 복원한 산출물의 SHA다.
외부 성공·기록 실패에서는 Vercel ID/EAS group을 대조해 결과를 복원한 뒤 재시도한다.
복구 시점의 이후 변경이 다시 자동 적용되지 않도록 검증 후 명시적으로 재개한다.
