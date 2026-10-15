import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { AttendanceSessionsPage, attendanceSessionSearchSchema } from '~/pages/attendance';

export const Route = createFileRoute('/_dashboard/attendance/')({
  staticData: { navigation: { menu: 'attendance', pageLabel: '출석부' } },
  validateSearch: attendanceSessionSearchSchema,
  search: { middlewares: [stripSearchParams({ part: 'all' })] },
  head: () => ({ meta: [{ title: '출석부 | YAPP+ Admin' }] }),
  component: AttendanceSessionsRoute,
});
function AttendanceSessionsRoute() {
  const { part } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <AttendanceSessionsPage
      part={part}
      onPartChange={(nextPart) => {
        void navigate({ search: { part: nextPart }, resetScroll: false });
      }}
    />
  );
}
