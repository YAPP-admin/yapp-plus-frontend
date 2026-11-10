# 재현·검증 안내

## 준비

저장소 루트에서 고정 도구로 실행한다. 운영 서버 대신 기존 개발용 MSW를 사용한다.

```sh
mise exec -- pnpm install --frozen-lockfile
VITE_API_MOCKING=true VITE_STATIC_CONTENT=false mise exec -- pnpm --filter @yapp-plus/web dev --host 127.0.0.1 --port 5184 --strictPort
```

`http://127.0.0.1:5184/dev/routes`에서 경로를 확인한다. 다른 workspace의 5173 서버를 사용하지 않는다.
iOS 설치 앱 검증은 이 코드와 연결된 검증 빌드·URL을 확인하고 수행한다. Safari 검증과 설치 앱 결과를 혼용하지 않는다.

## 화면별 순서

1. `/settings`: 첫 진입에서 로그아웃 전체 노출과 외부 스크롤을 기록한다. 로그아웃·탈퇴 팝업은 열고 취소하며 실제 계정 동작은 하지 않는다.
2. `/signup`: 이름에 합성 문자열을 입력하고 다음 → 휴대폰 → 헤더 뒤로가기 → 이름 → 다음을 확인한다. 입력값 보존·주소·포커스를 기록한다.
3. 가입에서 소프트웨어 키보드 닫힘 → 열림 → 다음 입력 → 닫힘·앱 복귀를 각각 기록한다. 브라우저 높이 축소만으로 키보드 검증을 통과시키지 않는다.
4. `/login`과 `/login?error=true`: 소셜 버튼 위치와 오류 팝업 좌우 경계를 측정한다. 외부 로그인을 실행하지 않는다.
5. `/signup/complete`, `/team-attendance/upload`, `/team-attendance/complete`, `/team-attendance/error`, `/login/error`: 그래픽·본문 끝·하단 버튼을 확인한다.
6. 출석 완료는 기존 출석 성공 흐름으로 진입한다. `/attendance/complete` 직접 진입 404를 레이아웃 결함으로 기록하지 않는다.
7. 홈·일정·게시판·마이페이지를 스크롤하고 왕복해 복원을 확인한다. 기존 목록에서 공지를 열고 읽음 확인이 본문 뒤에 있는지 확인한다.

## 환경과 측정 항목

- iOS 기준 크기: 375×667, 390×844. 홈 인디케이터 유무를 구분한다.
- Android 기준 크기: 360×640, 412×915. 실제 시스템 탐색 영역·키보드는 기기에서 확인한다.
- 320px 좁은 폭 팝업, 기본·큰 글자, 긴 오류·본문, OS 라이트·다크 환경을 포함한다.
- CSS px 기준 viewport 크기·visualViewport 높이/offsetTop/scale, 상하 safe-area, 헤더·본문·액션 rect, scrollHeight/clientHeight/scrollTop을 기록한다.
- 버튼 전체가 가시 영역 및 안전 영역 안에 있는지, 하단 여백이 중복되는지, 본문이 끝까지 도달하는지 비교한다.
- 캡처는 `.context/ui-baseline/<환경>-<화면>-<상태>.png` 또는 `.jpg`에 저장한다. 실제 입력·인증 정보는 포함하지 않는다.
- 도구 오류·접근 불가·실기기 미연결은 측정값 대신 미확인으로 기록한다.

## 자동 검증

```sh
mise exec -- node --run check
mise exec -- node --run build
```

회귀 테스트는 가시 영역 계산·활성 listener 수명, 가입 단계·값·오류·중복 제출, 설정 팝업,
탭·탐색·safe-area에 둔다. build는 제품 코드 변경 단계에서 실행한다.
결과에 새 실행과 Turbo 캐시 재사용을 구분하고 [validation.md](validation.md)에 기록한다.
