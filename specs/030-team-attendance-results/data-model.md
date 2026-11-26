# 데이터 모델: 팀 세션 결과와 표시 이력

## 서버 데이터와 표시 모델

생성 DTO를 복제하지 않고 기존 세션·내역·사진 타입을 그대로 소비한다. UI가 사용하는 변환 결과는
홈 슬라이스 내부의 TeamAttendanceResult이며 sessionId·세션 이름·날짜·photoId·kind를 가진다.
kind는 REJECTED | ABSENT | COMPLETED다. 반려만 reason·마감 시각·재업로드 가능 여부를 가진다.
새 공개 API·브리지 타입과 패키지 export는 추가하지 않는다.

판정 순서와 조회 일관성은 [계약](contracts/team-attendance-results.md)을 따른다.
결과는 서버 Query에서 계산하며 별도 state에 복사하지 않는다. 화면 수명에 필요한 열린 결과의
식별자와 이번 진입의 표시 여부만 홈의 로컬 상태로 관리한다.

## 표시 이력

키: `yapp-plus:team-attendance:shown:v1:<userId>:<generationId>`
값: 세션 ID 문자열을 키로, 마지막으로 표시한 `{ photoId: number | null, result }`를 값으로 갖는 JSON.

```json
{
  "101": { "photoId": 203, "result": "REJECTED" },
  "102": { "photoId": 208, "result": "COMPLETED" },
  "103": { "photoId": null, "result": "ABSENT" }
}
```

- result는 본인에게 표시한 세 종류만 허용하고 PENDING은 저장하지 않는다.
- 저장된 sessionId·photoId는 양의 안전한 정수만 허용한다. photoId:null은 정상 photo:null만 의미한다.
- JSON 파싱·기존 Zod 검증을 실패한 기록은 사용하지 않는다. 저장소 접근·쓰기 실패는
  현재 계정·기수의 메모리 이력으로 대체하며 홈 오류로 전파하지 않는다.
- 사용자·기수별 메모리 상태도 분리한다. 계정 변경 시 열린 결과와 메모리 수명은 종료하되
  이전 계정의 영구 이력은 보존해 같은 계정 재로그인에서 재사용한다.
- 이력에는 이름·반려 사유·사진 URL·파일·인증 정보를 저장하지 않는다.

## 갱신과 수명

1. 활성 홈에서 최신 결과 조회가 끝난 뒤 저장된 photoId와 result를 비교한다.
2. 같으면 다음 후보를 찾는다. 다르면 시트를 열고 실제 열린 상태에서 해당 세션 기록을 갱신한다.
3. 단순 닫기·확인·문의·재업로드는 기록 조건이 아니다. 재제출 성공 때도 기록을 지우지 않는다.
4. A가 같은 세션에 photoId 204를 제출하면 B의 203/REJECTED 기록은 유지된다. 이후 204/REJECTED나
   204/COMPLETED가 조회되면 B도 새 결과를 표시하고 기록을 바꾼다. 중간 PENDING 관찰은 필요 없다.
5. 같은 photoId의 본인 결과가 ABSENT에서 COMPLETED로 바뀌면 다시 표시한다. 사유 문구만 바뀐
   경우는 같은 결과로 취급한다. 관찰하지 못한 동일 사진·동일 결과의 중간 변경은 복원하지 않는다.

기기 간 동기화·서버 확인 처리·자동 만료는 추가하지 않는다. 저장소 삭제 뒤 다시 표시되는 것은
허용된 정책이다. 재제출 이후에도 이전 사진의 캐시를 표시하지 않도록 조회 무효화·복귀 갱신을 연결한다.
