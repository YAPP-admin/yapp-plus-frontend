import { Field, Select } from '@seed-design/react';
import { Check, ChevronDown } from 'lucide-react';

export function FilterSelect<T extends string>({
  label,
  value,
  options,
  labels,
  onChange,
  className,
}: {
  label: string;
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <Field.Root className={className}>
      <Field.Header>
        <Field.Label>{label}</Field.Label>
      </Field.Header>
      <Select.Root
        value={[value]}
        onValueChange={(values) => {
          const next = options.find((option) => option === values[0]);
          if (next !== undefined) {
            onChange(next);
          }
        }}
      >
        <Select.Trigger>
          <Select.Value>{labels[value]}</Select.Value>
          <Select.SuffixIcon svg={<ChevronDown aria-hidden="true" size={18} />} />
        </Select.Trigger>
        <Select.Positioner>
          <Select.Content data-seed-color-mode="dark-only">
            <Select.ScrollArea>
              <Select.Group>
                {options.map((option) => (
                  <Select.Item key={option} value={option} label={labels[option]}>
                    <Select.ItemBody>
                      <Select.ItemLabel />
                    </Select.ItemBody>
                    <Select.ItemIndicator selected={<Check aria-hidden="true" size={16} />} />
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.ScrollArea>
          </Select.Content>
        </Select.Positioner>
        <Select.HiddenSelect />
      </Select.Root>
    </Field.Root>
  );
}
