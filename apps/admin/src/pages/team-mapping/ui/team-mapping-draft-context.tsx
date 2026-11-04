/** 팀 매핑 화면의 생성·상세·미배정 초안 dirty 상태를 한 곳에서 관리한다. */
import { createContext, useContext, useReducer, type ReactNode } from 'react';

type TeamMappingDraftState = {
  createDirty: boolean;
  detailDirty: boolean;
  unassignedDirty: boolean;
};

export type TeamMappingDraftContextValue = TeamMappingDraftState & {
  hasDirtyDraft: boolean;
  setCreateDirty: (dirty: boolean) => void;
  setDetailDirty: (dirty: boolean) => void;
  setUnassignedDirty: (dirty: boolean) => void;
  resetDraft: () => void;
};

const initialState: TeamMappingDraftState = {
  createDirty: false,
  detailDirty: false,
  unassignedDirty: false,
};

const defaultContext: TeamMappingDraftContextValue = {
  ...initialState,
  hasDirtyDraft: false,
  setCreateDirty: () => undefined,
  setDetailDirty: () => undefined,
  setUnassignedDirty: () => undefined,
  resetDraft: () => undefined,
};

const TeamMappingDraftContext = createContext(defaultContext);

type DraftAction =
  | { type: 'create'; dirty: boolean }
  | { type: 'detail'; dirty: boolean }
  | { type: 'unassigned'; dirty: boolean }
  | { type: 'reset' };

function reducer(state: TeamMappingDraftState, action: DraftAction): TeamMappingDraftState {
  switch (action.type) {
    case 'create':
      return { ...state, createDirty: action.dirty };
    case 'detail':
      return { ...state, detailDirty: action.dirty };
    case 'unassigned':
      return { ...state, unassignedDirty: action.dirty };
    case 'reset':
      return initialState;
  }

  return state;
}

/** 팀 매핑 라우트의 초안 상태 공급자다. */
export function TeamMappingDraftProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value: TeamMappingDraftContextValue = {
    ...state,
    hasDirtyDraft: state.createDirty || state.detailDirty || state.unassignedDirty,
    setCreateDirty: (dirty) => dispatch({ type: 'create', dirty }),
    setDetailDirty: (dirty) => dispatch({ type: 'detail', dirty }),
    setUnassignedDirty: (dirty) => dispatch({ type: 'unassigned', dirty }),
    resetDraft: () => dispatch({ type: 'reset' }),
  };

  return (
    <TeamMappingDraftContext.Provider value={value}>{children}</TeamMappingDraftContext.Provider>
  );
}

/** 현재 팀 매핑 초안 상태를 읽는다. Provider 밖에서는 no-op 기본값을 사용한다. */
export function useTeamMappingDraft() {
  return useContext(TeamMappingDraftContext);
}

export { TeamMappingDraftContext };
