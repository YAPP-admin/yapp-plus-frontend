import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { SessionAttendancePage, attendanceSearchSchema } from '~/pages/attendance';

export const Route = createFileRoute('/_dashboard/attendance/$sessionId')({
  validateSearch: attendanceSearchSchema,
  search: { middlewares: [stripSearchParams({ part: 'all' })] },
  head: () => ({ meta: [{ title: '세션별 출석부 | YAPP+ Admin' }] }),
  component: SessionAttendanceRoute,
});
function SessionAttendanceRoute() {
  const { sessionId } = Route.useParams();
  const { part } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <SessionAttendancePage
      sessionId={sessionId}
      part={part}
      onPartChange={(nextPart) => {
        void navigate({ search: { part: nextPart }, resetScroll: false });
      }}
    />
  );
}
