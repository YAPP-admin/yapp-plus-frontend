# 구현 후 검증 절차

## 준비와 명령

`mise exec -- pnpm install --frozen-lockfile` 후 개발 웹을 `VITE_API_MOCKING=true mise exec -- node --run dev:web`로 시작한다. 새 사진 모듈은 iOS development build에서 검증하고 Expo Go·기존 설치본으로 완료 판정하지 않는다.

```sh
mise exec -- node --run check
mise exec -- node --run build
mise exec -- node --run expo:doctor
mise exec -- pnpm --filter @yapp-plus/web test
mise exec -- pnpm --filter @yapp-plus/mobile test
mise exec -- pnpm --filter @yapp-plus/app-bridge test
```

## 시나리오

| 계층   | 시나리오                             | 기대 결과                                       |
| ------ | ------------------------------------ | ----------------------------------------------- |
| native | JPEG·PNG·HEIC·카메라·회전·작은 사진  | JPEG·비율/방향 유지·비확대·긴 변 제한           |
| native | 취소·권한 거부·중복 picker·손상 사진 | 기존 선택 유지 또는 구분 가능한 오류, busy 해제 |
| 경계   | 0바이트·10MiB·10MiB+1·불일치 Base64  | 허용 경계만 통과, 잘못된 응답 차단              |
| API    | presign·PUT·submit 정상              | 같은 최종 바이트·체크섬, 201/PENDING 후 완료    |
| API    | PUT 실패·만료 URL·응답 유실          | submit 미호출 또는 결과 불명, 자동 재전송 없음  |
| 화면   | 본인 해제·중복 클릭·직접 완료 진입   | 본인 유지·한 번 제출·성공 위조 불가             |
| 운영   | production·mock 없는 개발 웹         | 팀 인증 직접 진입 차단·fixture 요청 없음        |

실제 iPhone에서 촬영·HEIC·큰 이미지의 메모리·브리지 전달·사진 가독성·VoiceOver·터치를 확인한다. 개발 화면에서 사용자가 제출하면 실제 서버로 요청한다. 에이전트의 실서버 제출·이미지 삭제·운영 배포는 검증에 포함하지 않는다.

## 2c 사진 준비 확인

- 개발 브라우저의 `/team-attendance/upload`에서는 고정 JPEG 패턴과 오류 안내 토글로 화면만 확인한다. 파일 선택·사진 변환은 제공하지 않고 fixture는 제출용 초안에 저장하지 않는다.
- native에서 같은 사진 재선택·다른 사진 교체·취소·손상 파일을 확인한다. 취소·오류 시 기존 사진이 유지되고 이탈·계정 변경 뒤에는 폐기되어야 한다.
- 브라우저의 제출 버튼은 비활성이다. native에서는 선택한 사진과 참석 팀원을 기존 서버 API에 제출한다. `?error=true`로 완료·오류 화면을 위조하지 않는다.
- native development build에는 새 사진 모듈이 포함되어야 하고 WebView가 모의 개발 서버를 열어야 한다. 앨범·촬영·HEIC·권한 거부·VoiceOver·큰 사진 메모리를 실제 기기에서 확인한다.
- 모의 설정이 꺼진 개발 서버와 production에서는 업로드 URL이 404 안내를 표시해야 한다. 완료·오류 Activity 전체 진입 차단은 4단계 범위다.

## 3단계 제출 로직 확인

- `mise exec -- pnpm --filter @yapp-plus/web test src/features/team-attendance`로 요청 순서·체크섬·참석 명단·PUT 격리·실패 분류·중복 실행·이탈을 검증한다. 테스트의 API와 PUT은 모두 MSW로 처리한다.
- 화면 연결은 4단계다. 공급부에서 `teamAttendanceTargetSchema`로 파싱한 대상과 인증 Provider의 `apiOptions`와 접수 성공 콜백을 `useTeamAttendance`에 전달한다. 훅의 `form`으로 사진·선택 명단을 관리하고 `form.handleSubmit()`으로 제출한다. native Blob은 `File`로 감싸며 재인코딩하지 않는다. 계정·대상 변경 시 폼 key를 바꾸고 비활성 화면의 입력·완료 흐름은 unmount한다.
- PUT은 30초 제한과 화면 이탈 신호를 함께 사용한다. 최종 POST를 중단해도 서버 처리가 취소됐다고 보장하지 않으며, 같은 요청을 자동 재전송하지 않는다.
- 상위 제출 mutation이 전체 상태를 관리하고 presign·PUT·최종 제출은 내부 세 mutation으로 실행하며 생성된 `presignMutation`·`submitMutation` options를 재사용한다. 서버가 준 업로드 주소·헤더는 추가 검증 없이 사용한다. 폼 값은 불변 갱신하고 별도 스냅샷을 만들지 않는다.

## 4단계 개발 화면 통합

- `DEV && VITE_API_MOCKING === 'true'`에서 로그인한 native 앱으로 `/team-attendance/upload`에 진입한다. 본인은 선택·잠금, 다른 팀원은 미선택으로 시작한다.
- 사진 선택 → 팀원 선택 → 인증 사진 제출하기 → 접수 완료를 확인한다. 완료에는 서버 시각·팀·제출 명단만 표시한다. 확인 후 홈으로 나가거나 계정이 바뀌면 접수 정보를 폐기한다. 완료 URL 직접 진입·새로고침은 성공을 복원하지 않는다.
- 사용자가 iPhone 15 Pro 시뮬레이터에서 앨범 시나리오 완료를 확인했다. 카메라·권한 거부·VoiceOver·큰 사진 메모리는 실기기에서 추후 점검한다.
- 개발 화면에서는 생성 SDK의 기본 API 주소와 인증 옵션을 사용한다. MSW는 팀 사진 presign·submit을 통과시키고, PUT은 서버가 준 주소로 보낸다. 세션·회원 ID는 개발 명단이므로 실제 접수에는 서버의 대상·권한 검증을 통과해야 한다.
- 실패·결과 불명 시나리오는 자동 테스트의 `createTeamPhotoHandlers`로 검증한다. 브라우저 고정 JPEG는 제출 초안으로 사용하지 않는다.
- 입력·완료는 `TeamAttendanceUpload` Activity의 단계로 연결한다. 접수 정보는 해당 활성 흐름의 로컬 state에만 보관하며, URL에는 `upload`/`complete` 단계만 기록한다. 계정 변경은 기존 인증 경계가 흐름을 다시 마운트하므로 별도 owner 비교나 전역 접수 Provider가 없다.
