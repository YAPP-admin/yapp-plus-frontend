/** 팀 사진 흐름의 두 Activity가 선택 사진을 URL에 노출하지 않고 짧게 공유한다. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type TeamAttendancePhotoDraft = Readonly<{ photo: File; previewUrl: string }>;

type TeamAttendancePhotoDraftContextValue = Readonly<{
  selectedPhoto: TeamAttendancePhotoDraft | null;
  setPhoto: (photo: File) => void;
  clearPhoto: () => void;
}>;

const TeamAttendancePhotoDraftContext = createContext<TeamAttendancePhotoDraftContextValue | null>(
  null,
);

/** 사진 선택부터 접수 완료 또는 흐름 이탈까지 File과 미리보기 URL만 메모리에 보관한다. */
export function TeamAttendancePhotoDraftProvider({ children }: { children: ReactNode }) {
  const [selectedPhoto, setSelectedPhoto] = useState<TeamAttendancePhotoDraft | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const clearPhoto = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setSelectedPhoto(null);
  }, []);
  const setPhoto = useCallback(
    (photo: File) => {
      clearPhoto();
      const previewUrl = URL.createObjectURL(photo);
      previewUrlRef.current = previewUrl;
      setSelectedPhoto({ photo, previewUrl });
    },
    [clearPhoto],
  );

  useEffect(() => clearPhoto, [clearPhoto]);

  return (
    <TeamAttendancePhotoDraftContext value={{ selectedPhoto, setPhoto, clearPhoto }}>
      {children}
    </TeamAttendancePhotoDraftContext>
  );
}

/** 팀 사진 Activity는 이 훅으로만 선택 사진을 읽고 폐기한다. */
export function useTeamAttendancePhotoDraft(): TeamAttendancePhotoDraftContextValue {
  const context = useContext(TeamAttendancePhotoDraftContext);
  if (!context) {
    throw new Error('TeamAttendancePhotoDraftProvider 안에서 사용해야 합니다.');
  }
  return context;
}
