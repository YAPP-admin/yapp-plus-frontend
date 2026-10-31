import { Chip, RadioGroup, RadioGroupField } from '@seed-design/react';
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
    <RadioGroupField.Root.Primitive
      className={filter}
      aria-label="세션 유형"
      value={selectedType}
      onValueChange={(value) => onValueChange(sessionFilterSchema.parse(value))}
    >
      {sessionFilterSchema.options.map((value) => (
        <Chip.Button key={value} asChild size="large" variant="solid">
          <RadioGroup.Item.Primitive value={value}>
            <Chip.Label>{sessionFilterLabels[value]}</Chip.Label>
            <RadioGroup.ItemHiddenInput />
          </RadioGroup.Item.Primitive>
        </Chip.Button>
      ))}
    </RadioGroupField.Root.Primitive>
  );
}
