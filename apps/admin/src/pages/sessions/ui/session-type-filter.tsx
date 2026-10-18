/** 전체·오프라인·팀 세션을 선택하는 SEED 칩 그룹을 표시합니다. */
import { Chip } from '@seed-design/react';
import { RadioGroup } from '@seed-design/react/primitive';
import {
  sessionFilterLabels,
  sessionFilterSchema,
  type SessionFilter,
} from '../model/session-search';
import { filter } from './sessions-page.css';

export function SessionTypeFilter({
  value: selectedType,
  onValueChange,
}: {
  value: SessionFilter;
  onValueChange: (value: SessionFilter) => void;
}) {
  return (
    <RadioGroup.Root
      className={filter}
      aria-label="세션 유형"
      value={selectedType}
      onValueChange={(value) => onValueChange(sessionFilterSchema.parse(value))}
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
  );
}
