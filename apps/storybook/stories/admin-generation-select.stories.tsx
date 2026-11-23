import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from '@seed-design/react';

type Generation = {
  generationId: number;
  generationName: string;
  generationNumber: number;
};

type GenerationSelectProps = {
  generations: Generation[];
};

function GenerationSelect({ generations }: GenerationSelectProps) {
  const [generationId, setGenerationId] = useState(generations[0]?.generationId);
  const currentGeneration = generations.find(
    (generation) => generation.generationId === generationId,
  );

  if (currentGeneration === undefined) {
    return null;
  }

  return (
    <div style={{ width: 320 }} data-seed-color-mode="dark-only">
      <Select.Root
        value={[String(generationId)]}
        onValueChange={(values) => {
          const nextGenerationId = Number(values[0]);
          setGenerationId(nextGenerationId);
        }}
      >
        <Select.Trigger aria-label="기수 선택">
          <Select.Value>{currentGeneration.generationName}</Select.Value>
        </Select.Trigger>
        <Select.Positioner>
          <Select.Content data-seed-color-mode="dark-only">
            <Select.ScrollArea>
              <Select.Group>
                {generations.map((generation) => (
                  <Select.Item
                    key={generation.generationId}
                    value={String(generation.generationId)}
                    label={`${generation.generationName} · ID ${generation.generationId}`}
                  >
                    <Select.ItemBody>
                      <Select.ItemLabel />
                    </Select.ItemBody>
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.ScrollArea>
          </Select.Content>
        </Select.Positioner>
        <Select.HiddenSelect />
      </Select.Root>
    </div>
  );
}

const defaultGenerations = [
  { generationId: 33, generationNumber: 33, generationName: '33기' },
  { generationId: 32, generationNumber: 32, generationName: '32기' },
  { generationId: 31, generationNumber: 31, generationName: '31기' },
];

const meta = {
  title: 'Admin/기수 선택',
  component: GenerationSelect,
  tags: ['autodocs'],
  args: { generations: defaultGenerations },
} satisfies Meta<typeof GenerationSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: '기본',
};

export const LongGenerationName: Story = {
  name: '긴 기수 이름',
  args: {
    generations: [
      {
        generationId: 33,
        generationNumber: 33,
        generationName: '33기 YAPP 운영진 정규 프로그램',
      },
      { generationId: 32, generationNumber: 32, generationName: '32기' },
    ],
  },
};

export const ManyGenerations: Story = {
  name: '여러 기수',
  args: {
    generations: Array.from({ length: 12 }, (_, index) => {
      const generationNumber = 33 - index;
      return {
        generationId: generationNumber,
        generationNumber,
        generationName: `${generationNumber}기`,
      };
    }),
  },
};
