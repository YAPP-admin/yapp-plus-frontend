/** 자동 테스트에서 생성 SDK의 팀 사진 API와 업로드 응답을 대체한다. 실행 앱에는 등록하지 않는다. */
import { http, HttpResponse } from 'msw';

/** 정상·확정 실패·결과 불명을 테스트 입력으로 선택한다. 사진 바이트는 저장하지 않는다. */
export function createTeamPhotoHandlers(base: string, state: string | null = null) {
  const endpoint = `${base}/api/sessions/:sessionId/team-attendance-photos`;
  return [
    http.post(`${endpoint}/presign`, () =>
      HttpResponse.json({
        imageKey: 'development/team-attendance.jpg',
        uploadUrl: `${base}/upload`,
        expiresAt: new Date(Date.now() + 300_000).toISOString(),
        signedHeaders: { 'Content-Type': 'image/jpeg' },
      }),
    ),
    http.put(
      `${base}/upload`,
      () => new HttpResponse(null, { status: state === 'upload-error' ? 500 : 200 }),
    ),
    http.post(endpoint, () => {
      if (state === 'unknown') {
        return HttpResponse.error();
      }
      if (state === 'rejected') {
        return HttpResponse.json({}, { status: 409 });
      }
      return HttpResponse.json(
        { photoId: 1, status: 'PENDING', submittedAt: new Date().toISOString() },
        { status: 201 },
      );
    }),
  ];
}
