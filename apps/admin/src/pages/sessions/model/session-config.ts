/** 세션 API가 사용할 기수 설정을 화면과 분리한다. */
import { z } from 'zod';

const generationIdSchema = z.string().trim().min(1).pipe(z.coerce.number());

/** 설정된 기수 ID를 반환하고, 누락되었거나 숫자가 아니면 null을 반환한다. */
export function getSessionGenerationId(): number | null {
  const result = generationIdSchema.safeParse(import.meta.env.VITE_ADMIN_GENERATION_ID);

  return result.success ? result.data : null;
}
