/** 생성 client와 관리자 기수 도메인 사이의 요청·응답 경계를 감쌉니다. */
import {
  list2,
  zAdminGenerationListResponse,
  type AdminGenerationListItemResponse,
  type AdminGenerationListResponse,
} from '@yapp-plus/api/generated';

export type GenerationListItem = AdminGenerationListItemResponse;
export type GenerationListResponse = AdminGenerationListResponse;

/** 관리 가능한 전체 기수 목록을 생성 client의 DTO 그대로 반환합니다. */
export async function listGenerations(signal?: AbortSignal): Promise<GenerationListResponse> {
  const { data } = await list2({
    signal,
    responseValidator: (value) => zAdminGenerationListResponse.parseAsync(value),
    throwOnError: true,
  });

  return data;
}

/** 조회 동작 이름을 명시적으로 읽고 싶은 소비자를 위한 별칭입니다. */
export const getGenerations = listGenerations;
