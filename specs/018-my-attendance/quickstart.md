# 검증 가이드

## 준비

저장소 루트에서 mise의 Node.js 24.20.0과 pnpm 12.3.4를 사용한다.
웹 테스트는 기존 MSW server, 개발 화면은 DEV+VITE_API_MOCKING=true를 사용한다.
운영 토큰·실제 회원 정보는 테스트 fixture·로그·스크린샷·문서에 남기지 않는다.
아래 이름·점수 fixture는 가상 데이터만 사용하며 실서버 쓰기 요청은 이번 검증에 필요하지 않다.

## 단계별 명령

```sh
# 1단계: 문서 경로·필수 파일 확인과 기본 품질 게이트
bash .specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks
mise exec -- node --run check

# 2단계: 이름 전달 경계
mise exec -- pnpm --filter @yapp-plus/app-bridge test
mise exec -- pnpm --filter @yapp-plus/mobile test

# 3·4단계: 화면과 조회
mise exec -- pnpm --filter @yapp-plus/web test

# 단계 종료 시 기본 게이트, 화면 변경 시 빌드
mise exec -- node --run check
mise exec -- node --run build
```

설정·의존성까지 모바일 변경이 확대되면 `mise exec -- node --run expo:doctor`를 추가한다.
인접 테스트를 확인한 뒤 루트 check를 실행하되 새 변경·실패 없이 같은 검증을 반복하지 않는다.

## 검증 시나리오

| 대상      | 입력·행동                                   | 기대 결과                                                      |
| --------- | ------------------------------------------- | -------------------------------------------------------------- |
| 이름      | 로그인·가입 후 재시작·refresh               | 같은 이름 유지, 이름은 캐시 식별자에 포함하지 않음             |
| 호환      | 이름 없는 version 1, null·숫자·공백 이름    | 로그인 유지, 이름만 `—`                                        |
| 격리      | A 갱신 지연 중 이름 없는 B 로그인           | A 이름·기록이 B에 나타나지 않음                                |
| 정리      | logout·withdraw 도중 이전 응답 도착         | 이름·업무 캐시 복구되지 않음                                   |
| 점수      | 정상·0점·0횟수                              | 실제 값 표시, 면제권은 `—`                                     |
| 미대상    | 계약의 두 미대상 code                       | 점수·횟수 `—`, 메뉴·규칙 사용 가능                             |
| 오류      | 미대상 외 code, 네트워크 오류, 잘못된 응답  | 오류·재시도, 빈 결과로 취급하지 않음                           |
| 유효성    | 음수 횟수, 안전 범위 밖 ID, 시작 > 전체     | 오류로 처리, 생성 타입과 런타임 ID 타입 일치                   |
| 배지      | 모든 출결 상태와 UNDECIDED의 각 운영진 판단 | 조회 계약의 문구·우선순위와 일치                               |
| 페이지    | 3페이지 이상, 중복 ID, 마지막 null          | 서버 순서 유지, ID당 1개, 이후 요청 없음                       |
| 반복      | 자기 cursor 또는 A→B→A                      | 자동 조회 멈춤, 기존 목록과 오류·재시도 유지                   |
| 빈 페이지 | items 없음 + cursor 있음/없음               | 다음 페이지 조회/최종 빈 화면 구분                             |
| 추가 실패 | 다음 페이지 네트워크·잘못된 cursor          | 기존 목록 유지, 재시도·처음부터 조회 가능                      |
| 경고      | 전체 absentCount 9/10, 점수 실패            | 10부터 경고, 점수 실패는 목록을 막지 않음                      |
| 복귀      | 같은 계정 stale 재조회 실패                 | 이전 값·실패 안내, 경고는 현재 유효한 점수에만 표시            |
| 탐색      | MY→내역→뒤로가기, 직접 URL·브라우저 back    | 부모 MY와 기존 스크롤 보존, mode는 데이터에 영향 없음          |
| 숨김      | 다른 Activity·탭으로 이동 후 sentinel 교차  | 숨겨진 화면에서 다음 페이지 요청 없음                          |
| 접근성    | 재시도 키보드 조작·스크린 리더·터치         | 상태 텍스트 읽기, 포커스 유지, 배지를 색상만으로 구분하지 않음 |

실기기는 새 native+새 웹, 구 native+새 웹 조합에서 확인한다.
이름을 저장하지 않은 기존 설치는 새 native에서도 재로그인 전 이름이 없을 수 있다.
실제 서버 확인이 불가능하면 MSW만 검증했다고 기록한다. 구 native 롤백은 이름을 제거할 수 있으나 로그인 자격은 보존해야 한다.

## 마이페이지 개발 시나리오

`VITE_API_MOCKING=true mise exec -- node --run dev:web`로 실행한다.
`/my`는 정상 점수, `?myState=ineligible`·`?myState=no-generation`은 미대상,
`?myState=loading`은 5초 지연, `?myState=error`는 최초 실패 후 재시도 성공이다.
이름 없는 브라우저의 프로필은 `—`이며 실제 세션 이름은 가상 native 세션 테스트로 확인한다.
운영에서는 이 query로 응답이나 인증 상태를 바꾸지 않는다.

## 실행 결과 기록

[validation.md](validation.md)에 명령, 실제 실행/캐시, 실패·미실행 사유와 단계 리뷰 상태를 기록한다.
UI 단계에서 `.context/`에 화면 증거를 저장하고 리뷰 응답에 첨부한다.
