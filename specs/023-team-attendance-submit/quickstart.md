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
