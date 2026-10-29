export type NoticeDetail = {
  id: string;
  category: 'SESSION' | 'ASSIGNMENT' | 'ETC';
  categoryLabel: string;
  title: string;
  date: string;
  dDay?: string;
  metaBox?: {
    deadline: string;
    target: string;
    submissionMethod: {
      label: string;
      url: string;
    };
  };
  content: string[];
  confirmedCount: number;
};

export const DEFAULT_NOTICE_DETAILS: Record<string, NoticeDetail> = {
  '1': {
    id: '1',
    category: 'ASSIGNMENT',
    categoryLabel: '과제',
    title: '팀빌딩 소개서 작성',
    date: '2026.09.30 (수)',
    dDay: 'D-2',
    metaBox: {
      deadline: '2026년 10월 01일 (금) 11:59까지',
      target: 'PM, Designer',
      submissionMethod: {
        label: '노션 페이지',
        url: 'https://notion.so',
      },
    },
    content: [
      "안녕하세요, 야뿌 여러분!\n프로젝트 진행을 위한 팀빌딩 과정의 첫 번째 단계인 '팀빌딩 자기소개서' 제출 안내드립니다.",
      '팀원들 간의 원활한 협업을 위해 양식에 맞춰 작성해 주시기 바랍니다.',
      '- 제출 기한\n2026년 10월 2일(금) 23:59까지',
      '- 작성 항목\n희망 파트 (App / Web)\n다뤄본 주요 기술 및 사용 가능한 언어 (Tech Stack)\n간단한 개인 프로젝트 경험 또는 포트폴리오 링크\n이번 동아리를 통해 꼭 이루고 싶은 목표',
      '- 제출 방법\n노션 서비스 내 [팀세션 > 팀 소개서] 탭에 작성',
      '문의 사항이 있으신 분은 운영진에게 연락 주세요.\n감사합니다.',
    ],
    confirmedCount: 13,
  },
  '2': {
    id: '2',
    category: 'ASSIGNMENT',
    categoryLabel: '과제',
    title: '1차 UT 준비 과제',
    date: '2026.09.28 (월)',
    dDay: 'D-14',
    metaBox: {
      deadline: '2026년 10월 10일 (토) 12:00까지',
      target: 'All (기획, 디자인, 개발)',
      submissionMethod: {
        label: '구글 드라이브',
        url: 'https://drive.google.com',
      },
    },
    content: [
      '1차 사용자 테스트(UT) 진행을 위한 사전 준비 과제 안내드립니다.',
      '각 팀별 프로토타입 링크와 테스트 시나리오 문서를 기한 내에 업로드해 주시기 바랍니다.',
      '- 준비 항목\n1. 피그마 프로토타입 링크\n2. 주요 유저 플로우별 태스크 시나리오\n3. 테스트 대상자 피드백 기록 양식',
      '성공적인 UT 진행을 위해 팀원 모두와 함께 리뷰 후 제출 부탁드립니다.',
    ],
    confirmedCount: 8,
  },
  '3': {
    id: '3',
    category: 'SESSION',
    categoryLabel: '세션',
    title: '5주차 개발-디자인 세션 공지',
    date: '2026.09.24 (수)',
    content: [
      '안녕하세요, 야뿌 여러분!\n이번 주 토요일 진행되는 5주차 개발-디자인 세션 안내드립니다.',
      '- 일시: 2026년 10월 3일(토) 14:00 - 18:00\n- 장소: DMC 첨단산업센터 7층 세미나실\n- 준비물: 노트북, 충전기',
      '세션 시작 10분 전까지 도착해 주시기 바랍니다.\n감사합니다.',
    ],
    confirmedCount: 25,
  },
  '4': {
    id: '4',
    category: 'ETC',
    categoryLabel: '기타',
    title: '뒷풀이 참석 여부 수요 조사',
    date: '2026.09.20 (토)',
    content: [
      '세션 종료 후 진행되는 뒷풀이 참석 여부 사전 수요 조사를 진행합니다.',
      '원활한 장소 예약과 인원 파악을 위해 참석을 희망하시는 분들은 꼭 투표에 참여해 주시기 바랍니다.',
      '- 일시: 세션 종료 직후 (오후 6시 30분 예정)\n- 장소: 선릉역 인근 식당 (상세 장소 추후 공지)\n- 회비: 현장 정산',
      '많은 참여 부탁드립니다!',
    ],
    confirmedCount: 31,
  },
  '5': {
    id: '5',
    category: 'ETC',
    categoryLabel: '기타',
    title: '운영진 공지 사항',
    date: '2026.09.18 (목)',
    content: [
      'YAPP+ 동아리 운영 관련 공지사항 안내드립니다.',
      '출석 및 활동 점수 관련 문의는 카카오톡 채널 또는 운영진에게 문의해 주세요.',
      '원활한 세션 진행을 위해 적극적인 협조 부탁드립니다.',
    ],
    confirmedCount: 42,
  },
};

export function getNoticeDetailById(id: string): NoticeDetail | undefined {
  return DEFAULT_NOTICE_DETAILS[id];
}
