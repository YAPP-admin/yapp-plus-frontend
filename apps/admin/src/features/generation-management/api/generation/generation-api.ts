/** 생성 client와 관리자 기수 도메인 사이의 요청·응답 경계를 감쌉니다. */
import { client } from '@yapp-plus/api/generated';
import { z } from 'zod';

const generationListItemSchema = z.object({
  generationId: z.number(),
  generationNumber: z.number(),
  generationName: z.string(),
});

const generationListResponseSchema = z.object({
  generations: generationListItemSchema.array(),
});

export type GenerationListItem = z.infer<typeof generationListItemSchema>;
export type GenerationListResponse = z.infer<typeof generationListResponseSchema>;

type GenerationListResponses = { 200: GenerationListResponse };
type GenerationListErrors = { 401: unknown; 500: unknown };

/** 관리 가능한 전체 기수 목록을 생성 client의 DTO 그대로 반환합니다. */
export async function listGenerations(signal?: AbortSignal): Promise<GenerationListResponse> {
  const { data } = await client.get<GenerationListResponses, GenerationListErrors, true>({
    security: [
      {
        key: 'staffBearerAuth',
        scheme: 'bearer',
        type: 'http',
      },
    ],
    url: '/api/admin/generations',
    signal,
    responseValidator: (value) => generationListResponseSchema.parseAsync(value),
    throwOnError: true,
  });

  return data;
}

/** 조회 동작 이름을 명시적으로 읽고 싶은 소비자를 위한 별칭입니다. */
export const getGenerations = listGenerations;
