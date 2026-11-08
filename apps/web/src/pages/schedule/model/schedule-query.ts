import { queryOptions } from '@tanstack/react-query';
import { find4Options } from '@yapp-plus/api/generated';
import { getStaticSchedule, staticContentEnabled } from '@/features/static-content';
import { scheduleSchema } from './schedule-schema';

export function scheduleQueryOptions(options?: Parameters<typeof find4Options>[0]) {
  const generated = find4Options({
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
