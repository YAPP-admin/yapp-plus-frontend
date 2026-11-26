/** 홈의 표시 이력만 보존합니다. 계정 수명이 끝나면 인스턴스를 버리고 영구 기록은 유지합니다. */
import { z } from 'zod';
import type { TeamAttendanceResult } from './team-attendance-result';

const ID = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const RECORDS = z.record(
  z
    .string()
    .regex(/^[1-9]\d*$/)
    .refine((value) => Number.isSafeInteger(Number(value))),
  z.object({ photoId: ID.nullable(), result: z.enum(['REJECTED', 'ABSENT', 'COMPLETED']) }),
);
type Records = z.infer<typeof RECORDS>;
type Scope = { userId: number; generationId: number };
type Identity = Pick<TeamAttendanceResult, 'sessionId' | 'photoId' | 'kind'>;

/** SSR·접근 거부·쓰기 실패는 계정 수명의 메모리로 대체합니다. 호출만으로 기록하지 않습니다. */
export function createTeamAttendanceResultStorage(
  getStorage = (): Pick<Storage, 'getItem' | 'setItem'> => window.localStorage,
) {
  const memory = new Map<string, Records>();
  function key(scope: Scope) {
    return `yapp-plus:team-attendance:shown:v1:${ID.parse(scope.userId)}:${ID.parse(scope.generationId)}`;
  }
  function read(storageKey: string): Records {
    try {
      const parsed = RECORDS.safeParse(JSON.parse(getStorage().getItem(storageKey) ?? '{}'));
      return { ...(parsed.success ? parsed.data : {}), ...memory.get(storageKey) };
    } catch {
      return memory.get(storageKey) ?? {};
    }
  }
  return {
    /** 같은 사진·개인 결과만 생략하며, 재제출 전의 PENDING 관찰을 요구하지 않습니다. */
    hasShown(scope: Scope, result: Identity) {
      const record = read(key(scope))[result.sessionId];
      return (
        record !== undefined && record.photoId === result.photoId && record.result === result.kind
      );
    },
    /** 실제 시트 표시 후에만 호출합니다. 사유·URL·이름 등 표시용 데이터는 저장하지 않습니다. */
    markShown(scope: Scope, result: Identity) {
      const storageKey = key(scope);
      const records = RECORDS.parse({
        ...read(storageKey),
        [result.sessionId]: { photoId: result.photoId, result: result.kind },
      });
      memory.set(storageKey, records);
      try {
        getStorage().setItem(storageKey, JSON.stringify(records));
      } catch {
        // 저장 공간·보안 설정 실패도 현재 실행에서는 중복 안내를 막습니다.
      }
    },
  };
}

/** 홈이 계정 단위로 소유하며 조회와 실제 표시 시점에 같은 인스턴스를 전달합니다. */
export type TeamAttendanceResultStorage = ReturnType<typeof createTeamAttendanceResultStorage>;
