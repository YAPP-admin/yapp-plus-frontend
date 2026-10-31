# `@yapp-plus/ui` 공개 계약

## 패키지 의존성

```json
{
  "dependencies": {
    "clsx": "catalog:"
  },
  "peerDependencies": {
    "@seed-design/css": "^3.1.0",
    "@seed-design/react": "^3.1.0"
  }
}
```

기존 React·React DOM peer 계약은 유지합니다. SEED 2와의 동시 호환은 제공하지 않습니다.

## 공개 export

`packages/ui/src/index.ts`는 기존 export에 다음 계약을 추가합니다.

```ts
export { Badge, type BadgeProps } from './seed-design/ui/badge';
export { DatePicker, type DatePickerProps } from './seed-design/ui/date-picker';
export { TimePicker, type TimePickerProps } from './seed-design/ui/time-picker';
```

`ActionButton`과 기존 props 타입의 import 경로·호출 방식은 유지합니다. 최신 snippet의 ref 전달과 v3 호환 메타데이터는 내부 구현에 반영합니다.

## 비공개 항목

- `WheelPicker`와 그 props 타입
- 현재 사용하지 않는 Date Picker 변형
- SEED 내부 primitive나 headless 패키지 타입
- snippet 구현 파일의 보조 컴포넌트

앱은 위 항목을 `@yapp-plus/ui` 공개 진입점에서 기대하지 않습니다.

## 관리자 앱 계약 이동

| v2 사용                     | v3 사용                          | 보존할 동작                              |
| --------------------------- | -------------------------------- | ---------------------------------------- |
| Alert 용 `Dialog`           | `AlertDialog`                    | `alertdialog`, 바깥 클릭 차단, 확인·취소 |
| 일반 `ContentDialog`        | `Dialog`                         | 중첩 포커스와 Escape                     |
| `Chip.Root`                 | `Chip.Button`                    | 버튼 의미와 스타일                       |
| primitive `RadioGroup.Root` | `RadioGroupField.Root.Primitive` | 선택 상태와 그룹 이름                    |
| primitive `RadioGroup.Item` | `RadioGroup.Item.Primitive`      | 키보드 선택                              |
| `FileEntry`                 | `AttachmentInputFileEntry`       | 파일 상태 표현                           |
| `useFileUploadContext`      | `useAttachmentInputContext`      | 추가·제거·거절 흐름                      |
| 직접 `Badge`·Picker         | `@yapp-plus/ui` export           | 현재 props와 사용자 흐름                 |

파일 거절 타입은 새 의존성 대신 다음 공개 콜백 계약에서 파생합니다.

```ts
type FileRejection = Parameters<NonNullable<AttachmentInputRootProps['onFileReject']>>[0][number];
```

실제 콜백의 첫 인자 형태가 설치된 v3 타입과 다르면 같은 원칙으로 해당 공개 함수 시그니처에서 파생하며, 무검증 단언은 사용하지 않습니다.

## 호환성 판정

- 앱의 Badge·Date Picker·Time Picker import는 `@yapp-plus/ui`만 사용합니다.
- 제거된 v2 이름과 `layerFill` 검색 결과는 0건입니다.
- `pnpm dlx @seed-design/cli@1.7.3 compat --cwd packages/ui`가 성공합니다.
