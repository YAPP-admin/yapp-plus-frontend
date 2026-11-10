# 실행·검증 안내

## 전제

저장소 루트에서 mise가 고정한 Node.js·pnpm과 설치된 의존성을 사용한다.
각 단계의 사용자 리뷰를 통과한 뒤 해당 단계 명령을 실행한다. 아래 명령은 실행 결과 기록이 아니다.
현재 1단계에서는 생성기·앱 연동을 실행하지 않는다.

## 2단계: 생성

```sh
curl --fail --silent --show-error --max-time 60 \
  https://44nk4mnqi7.execute-api.ap-northeast-2.amazonaws.com/v3/api-docs \
  -o .context/profile-openapi.json
shasum -a 256 .context/profile-openapi.json
OPENAPI_INPUT="$PWD/.context/profile-openapi.json" \
  mise exec -- pnpm --filter @yapp-plus/api generate
mise exec -- node --run check
mise exec -- node --run build
```

다운로드 실패 또는 프로필 계약 누락이면 생성하지 않는다. 수신 시각·해시, 생성 operation 연결,
소비 코드 수정과 추가·삭제 줄 수를 `validation.md`에 기록한다. 최신 파일을 받지 못한 상태에서 기존 파일을 대체 입력으로 사용하지 않는다.

## 3단계: 가까운 테스트와 화면

```sh
mise exec -- pnpm --filter @yapp-plus/web exec vitest run src/pages/my
VITE_STATIC_CONTENT=false VITE_API_MOCKING=true mise exec -- node --run dev:web
```

개발 서버는 `VITE_STATIC_CONTENT=false`, `VITE_API_MOCKING=true`로 `/my`를 확인한다. 정적 콘텐츠 모드에서는 MSW가 시작되지 않는다. 운영 설정을 변경하지 않는다.
모델 매핑·스키마 검증은 모델 테스트, 표시·재시도·독립성은 화면 테스트, 계정 폐기·늦은 응답은 인증 Provider를 포함한 회귀 사례에서 한 번씩 확인한다.

| 사례                                  | 기대 결과                                         |
| ------------------------------------- | ------------------------------------------------- |
| 세션 이름과 API 이름이 다름           | API 이름만 표시                                   |
| 정상·소속 전체 null·직군 null         | 데이터 모델에 따른 네 항목 표시                   |
| 지연·409·503·네트워크·잘못된 응답     | 프로필만 로딩 또는 오류, 출석·메뉴·규칙 이용 가능 |
| 최초 실패 후 재시도                   | 프로필만 갱신되고 성공 값 표시                    |
| 재조회 실패                           | 마지막 성공 값과 이전 내용 안내                   |
| 미로그인·로그아웃·계정 전환·늦은 응답 | 금지된 조회나 이전 계정 정보 노출 없음            |
| 탭·상세 복귀                          | stale이면 갱신, fresh이면 추가 강제 조회 없음     |

## 4단계: 최종 검증

```sh
mise exec -- node --run check
mise exec -- node --run build
git diff --check
```

320px·일반 모바일 너비와 긴 이름, 라이트·다크 모드에서 가로 넘침·정보 가림을 확인한다.
키보드·터치로 재시도하고 스크린 리더의 상태·오류 안내를 확인한다. 캡처는 `.context/`에 저장한다.
사용 가능한 인증 환경에서 WebView·실서버 조회를 확인하되 토큰·실제 개인정보를 로그·문서·캡처에 남기지 않는다.
환경이 없으면 미실행으로 표시하고 자동 테스트 결과로 실기기 성공을 대신 주장하지 않는다.

검증 결과는 신규 실행·Turbo 캐시·실패·미실행을 구분한다. 문서·테스트·생성 파일을 모두 포함해
merge-base 대비 변경량을 계산하며 untracked 파일도 합산한다. 800줄 이상이면 분리 전에 다음 구현을 진행하지 않는다.
