/** 관리자 기수 목록 조회와 페이지 간 선택 수명을 Context로 제공한다. */
import { createContext, useContext, useState, type ReactNode } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { GenerationListItem } from '~/features/generation-management/api';
import { generationsQueryOptions } from '~/features/generation-management/api';

type AdminGenerationContextValue = {
  generations: GenerationListItem[];
  currentGeneration: GenerationListItem;
  selectGeneration: (generationId: number) => void;
};

const AdminGenerationContext = createContext<AdminGenerationContextValue | null>(null);

/** 인증된 관리자 작업 영역에서 기수 목록과 현재 선택을 제공한다. */
export function AdminGenerationProvider({ children }: { children: ReactNode }) {
  const { data } = useSuspenseQuery(generationsQueryOptions());
  // OpenAPI 생성 타입은 최소 길이를 표현하지 않지만 서버 계약상 목록에는 항상 기수가 하나 이상이다.
  // oxlint-disable-next-line typescript/no-non-null-assertion -- 서버 계약의 non-empty 배열을 보존한다.
  const firstGeneration = data.generations[0]!;
  const [selectedGenerationId, setSelectedGenerationId] = useState(
    () => firstGeneration.generationId,
  );

  const currentGeneration =
    data.generations.find((generation) => generation.generationId === selectedGenerationId) ??
    firstGeneration;

  return (
    <AdminGenerationContext.Provider
      value={{
        generations: data.generations,
        currentGeneration,
        selectGeneration: (generationId) => {
          if (data.generations.some((generation) => generation.generationId === generationId)) {
            setSelectedGenerationId(generationId);
          }
        },
      }}
    >
      {children}
    </AdminGenerationContext.Provider>
  );
}

/** 현재 관리자 작업 영역의 기수와 선택 함수를 반환한다. */
export function useAdminGeneration() {
  const value = useContext(AdminGenerationContext);
  if (value === null) {
    throw new Error('AdminGenerationProvider 안에서 useAdminGeneration을 호출해야 합니다.');
  }
  return value;
}
