import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { AttendanceScoresPage, attendanceSearchSchema } from '~/pages/attendance';

export const Route = createFileRoute('/_dashboard/attendance/scores')({
  staticData: { navigation: { menu: 'attendanceScores', pageLabel: '출석 총점' } },
  validateSearch: attendanceSearchSchema,
  search: { middlewares: [stripSearchParams({ part: 'all' })] },
  head: () => ({ meta: [{ title: '출석 총점 | YAPP+ Admin' }] }),
  component: AttendanceScoresRoute,
});
function AttendanceScoresRoute() {
  const { part } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <AttendanceScoresPage
      part={part}
      onPartChange={(nextPart) => {
        void navigate({ search: { part: nextPart }, resetScroll: false });
      }}
    />
  );
}
