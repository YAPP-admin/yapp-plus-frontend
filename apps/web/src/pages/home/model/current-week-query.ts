import { queryOptions } from '@tanstack/react-query';
import { find3Options } from '@yapp-plus/api/generated';
import { getStaticCurrentWeek, staticContentEnabled } from '@/features/static-content';
import { currentWeekSchema } from './current-week-schema';

export function currentWeekQueryOptions(options?: Parameters<typeof find3Options>[0]) {
  const generated = find3Options({
    ...options,
    responseValidator: (value) => currentWeekSchema.parseAsync(value),
  });
  return staticContentEnabled()
    ? queryOptions({
        ...generated,
        queryFn: () =>
          getStaticCurrentWeek().then(async (data) => {
            await currentWeekSchema.parseAsync(data);
            return data;
          }),
      })
    : generated;
}
