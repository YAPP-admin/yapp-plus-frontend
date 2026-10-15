import { Field, Select } from '@seed-design/react';

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
          <Select.SuffixIcon
            svg={
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="m6 9 6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
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
                    <Select.ItemIndicator
                      selected={
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="m5 12 4 4L19 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      }
                    />
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
