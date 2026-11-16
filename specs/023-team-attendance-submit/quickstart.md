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

실제 iPhone에서 촬영·HEIC·큰 이미지의 메모리·브리지 전달·사진 가독성·VoiceOver·터치를 확인한다. 실서버 제출·운영 배포는 포함하지 않는다.

## 2c 사진 준비 확인

- 개발 브라우저의 `/team-attendance/upload`에서는 고정 JPEG 패턴과 오류 안내 토글로 화면만 확인한다. 파일 선택·사진 변환은 제공하지 않고 fixture는 제출용 초안에 저장하지 않는다.
- native에서 같은 사진 재선택·다른 사진 교체·취소·손상 파일을 확인한다. 취소·오류 시 기존 사진이 유지되고 이탈·계정 변경 뒤에는 폐기되어야 한다.
- 이 화면의 제출 버튼은 비활성이다. `?error=true`도 완료·오류 화면으로 이동시키지 않는다. 팀원 선택 정책·제출 API는 후속 단계에서 연결한다.
- native development build에는 새 사진 모듈이 포함되어야 하고 WebView가 모의 개발 서버를 열어야 한다. 앨범·촬영·HEIC·권한 거부·VoiceOver·큰 사진 메모리를 실제 기기에서 확인한다.
- 모의 설정이 꺼진 개발 서버와 production에서는 업로드 URL이 404 안내를 표시해야 한다. 완료·오류 Activity 전체 진입 차단은 4단계 범위다.

## 3단계 제출 로직 확인

- `mise exec -- pnpm --filter @yapp-plus/web test src/features/team-attendance`로 요청 순서·체크섬·참석 명단·PUT 격리·실패 분류·중복 실행·이탈을 검증한다. 테스트의 API와 PUT은 모두 MSW로 처리한다.
- 화면 연결은 4단계다. 공급부에서 `teamAttendanceTargetSchema`로 파싱한 대상과 인증 Provider의 `apiOptions`를 `useTeamAttendance`에 전달한다. 훅의 `form`으로 사진·선택 명단을 관리하고 `form.handleSubmit()`으로 제출한다. native Blob은 `File`로 감싸며 재인코딩하지 않는다. 계정·대상 변경 시 폼 key를 바꾸고 비활성 화면의 폼은 unmount한다.
- PUT은 30초 제한과 화면 이탈 신호를 함께 사용한다. 최종 POST를 중단해도 서버 처리가 취소됐다고 보장하지 않으며, 같은 요청을 자동 재전송하지 않는다.
- presign·PUT·최종 제출은 세 mutation으로 실행하며 생성된 `presignMutation`·`submitMutation` options를 재사용한다. 서버가 준 업로드 주소·헤더는 추가 검증 없이 사용한다. 폼 값은 불변 갱신하고 별도 스냅샷을 만들지 않는다.
