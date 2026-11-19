# 검증 절차

## 전제

고정된 mise 도구와 설치된 의존성을 사용한다. MSW 테스트에는 두 기수의 ID와 번호가 서로
다른 fixture를 사용한다. 기수 번호를 API ID로 잘못 전달하는 회귀를 검출하기 위함이다.

## 2단계 API 재생성

저장소 루트에서 공개 명세를 `.context/admin-generation-openapi.json`으로 내려받고 해시를 기록한다.
2단계 착수 때 파일의 수신일과 최신 명세 변경 여부를 다시 확인한다.

```sh
OPENAPI_INPUT="$PWD/.context/admin-generation-openapi.json" mise exec -- pnpm --filter @yapp-plus/api generate
mise exec -- node --run check
mise exec -- node --run build
```

생성 이름이 바뀐 기존 API의 HTTP 경로·모의 응답 대응을 확인한다. 생성 파일은 수동 수정하지 않는다.

## 3·4단계 자동 검증

```sh
mise exec -- pnpm --filter @yapp-plus/admin test
mise exec -- node --run check
mise exec -- node --run build
```

- Provider/모델: 첫 항목 선택, 응답 검증, 500을 전역 오류 경계로 전파하는 동작,
  401의 access token 삭제·Query 제거·즉시 로그인 이동, 재시도, 유효 선택 유지·삭제된 선택 교체.
  기수 목록은 서버 계약상 하나 이상이므로 빈 목록 UI는 검증 대상이 아니다.
- 실제 route tree: 로그인 성공·401 후 캐시 폐기 순서와 요청 순서·인증 헤더, 미로그인·SSR 요청 차단,
  새로고침·재로그인 초기화.
- 세션 연결: 선택 기수 ID로 조회·생성·수정·삭제, 기수별 key와 무효화.
- 전환 수명: 지연 조회·저장 완료가 현재 목록·알림·필터를 변경하지 않음, 모달·초안 폐기.
- 같은 오류 조합을 모든 계층에서 반복하지 않는다. 기존 세션 폼·API 회귀 테스트는 유지한다.

## 브라우저와 실서버

```sh
mise exec -- node --run dev:admin
```

Doppler 접근 권한이 필요하다. 비밀 값을 파일이나 로그에 출력하지 않는다.
데스크톱·좁은 화면에서 로그인, 기수 선택, 메뉴 왕복, 세션 필터 유지, 재시도를 확인한다.
키보드 포커스·스크린 리더 이름과 선택 상태·터치 조작을 확인하고 화면 근거는 `.context/`에 저장한다.
실서버 쓰기는 승인된 테스트 기수·대상·정리 범위가 있을 때만 수행한다. 그 외에는 MSW 검증으로
표시하고 실서버 CRUD 완료로 보고하지 않는다.

## 완료 보고

검증 기록에 실제 명령·결과·새 실행/캐시 재사용·미실행 사유·남은 위험을 기록한다.
문서 단계에는 제품 빌드·브라우저·실서버 쓰기를 실행하지 않는다.
