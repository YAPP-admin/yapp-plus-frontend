import { Chip } from '@seed-design/react';
import { RadioGroup } from '@seed-design/react/primitive';
import {
  sessionFilterLabels,
  sessionFilterSchema,
  type SessionFilter,
} from '../model/session-search';
import { page, title, description, filter, placeholder } from './sessions-page.css';

export function SessionsPage({
  type,
  onTypeChange,
}: {
  type: SessionFilter;
  onTypeChange: (type: SessionFilter) => void;
}) {
  return (
    <main className={page}>
      <h1 className={title}>세션 관리</h1>
      <p className={description}>유형별 세션을 확인합니다.</p>
      <RadioGroup.Root
        className={filter}
        aria-label="세션 유형"
        value={type}
        onValueChange={(value) => onTypeChange(sessionFilterSchema.parse(value))}
      >
        {sessionFilterSchema.options.map((value) => (
          <Chip.Root key={value} asChild size="large" variant="solid">
            <RadioGroup.Item value={value}>
              <Chip.Label>{sessionFilterLabels[value]}</Chip.Label>
              <RadioGroup.ItemHiddenInput />
            </RadioGroup.Item>
          </Chip.Root>
        ))}
      </RadioGroup.Root>
      <p className={placeholder}>세션 목록을 준비 중입니다.</p>
    </main>
  );
}
