import { queryOptions } from '@tanstack/react-query';
import { find7Options } from '@yapp-plus/api/generated';
import { getStaticSchedule, staticContentEnabled } from '@/features/static-content';
import { scheduleSchema } from './schedule-schema';

export function scheduleQueryOptions(options?: Parameters<typeof find7Options>[0]) {
  const generated = find7Options({
    ...options,
    responseValidator: (value) => scheduleSchema.parseAsync(value),
  });
  return staticContentEnabled()
    ? queryOptions({
        ...generated,
        queryFn: () =>
          getStaticSchedule().then(async (data) => {
            await scheduleSchema.parseAsync(data);
            return data;
          }),
      })
    : generated;
}
