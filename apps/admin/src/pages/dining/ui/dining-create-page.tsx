import { Field, Select } from '@seed-design/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ActionButton, TextField, TextFieldInput, TextFieldTextarea } from '@yapp-plus/ui';
import { SessionScheduleField } from '~/pages/sessions/ui/session-schedule-field';
import * as styles from './dining-create-page.css';

type InviteOption = 'STAFF' | 'ACTIVE_MEMBER';

const inviteOptions: readonly { value: InviteOption; label: string }[] = [
  { value: 'STAFF', label: '운영진' },
  { value: 'ACTIVE_MEMBER', label: '활동회원' },
];

const generationOptions = [
  { value: '32', label: '32기' },
  { value: '33', label: '33기' },
  { value: '34', label: '34기' },
] as const;
type GenerationValue = (typeof generationOptions)[number]['value'];

function isGenerationValue(value: string | undefined): value is GenerationValue {
  return generationOptions.some((option) => option.value === value);
}

const weekdayFormatter = new Intl.DateTimeFormat('ko-KR', {
  weekday: 'short',
  timeZone: 'Asia/Seoul',
});

function formatDateValue(value: string) {
  const date = new Date(`${value}T00:00:00+09:00`);
  return `${value.replaceAll('-', '.')} (${weekdayFormatter.format(date)})`;
}

export function DiningCreatePage() {
  const [title, setTitle] = useState('4월 정기 뒤풀이');
  const [introduction, setIntroduction] = useState(
    '4월 세션 끝나고 다 같이 저녁 먹어요. 장소는 응답 인원 보고 정할게요.',
  );
  const [diningDate, setDiningDate] = useState('2026-04-25');
  const [diningTime, setDiningTime] = useState('18:30');
  const [responseDeadline, setResponseDeadline] = useState('2026-04-22');
  const [responseDeadlineTime, setResponseDeadlineTime] = useState('23:59');
  const [selectedInviteOptions, setSelectedInviteOptions] = useState<InviteOption[]>([
    'STAFF',
    'ACTIVE_MEMBER',
  ]);
  const [generation, setGeneration] = useState<GenerationValue>('33');
  const [maxAttendees, setMaxAttendees] = useState('');

  function toggleInviteOption(value: InviteOption) {
    setSelectedInviteOptions((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>DINNER</p>
        <h1 className={styles.title}>뒤풀이 만들기</h1>
        <p className={styles.description}>저장하면 초대 범위의 회원 앱에 바로 노출돼요.</p>
      </header>

      <form
        className={styles.form}
        aria-label="뒤풀이 만들기"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset className={styles.fields}>
          <TextField
            label="제목"
            required
            showRequiredIndicator
            value={title}
            onValueChange={({ value }) => setTitle(value)}
          >
            <TextFieldInput name="title" />
          </TextField>

          <TextField
            label="소개 글"
            required
            showRequiredIndicator
            value={introduction}
            onValueChange={({ value }) => setIntroduction(value)}
          >
            <TextFieldTextarea name="introduction" className={styles.introductionTextarea} />
          </TextField>

          <div className={styles.schedule}>
            <Field.Root className={styles.field} required>
              <Field.Label className={styles.fieldLabel}>
                뒤풀이 날짜 <span className={styles.required}>*</span>
              </Field.Label>
              <div className={styles.dateTimeFields}>
                <SessionScheduleField
                  type="date"
                  label="뒤풀이 날짜"
                  value={diningDate}
                  displayValue={formatDateValue(diningDate)}
                  labelClassName={styles.visuallyHidden}
                  disabled={false}
                  onChange={setDiningDate}
                  onBlur={() => undefined}
                />
                <SessionScheduleField
                  type="time"
                  label="뒤풀이 시간"
                  value={diningTime}
                  labelClassName={styles.visuallyHidden}
                  disabled={false}
                  onChange={setDiningTime}
                  onBlur={() => undefined}
                />
              </div>
            </Field.Root>

            <Field.Root className={styles.field} required>
              <Field.Label className={styles.fieldLabel}>
                조사 기한 <span className={styles.required}>*</span>
              </Field.Label>
              <div className={styles.dateTimeFields}>
                <SessionScheduleField
                  type="date"
                  label="조사 기한"
                  value={responseDeadline}
                  displayValue={formatDateValue(responseDeadline)}
                  labelClassName={styles.visuallyHidden}
                  disabled={false}
                  onChange={setResponseDeadline}
                  onBlur={() => undefined}
                />
                <SessionScheduleField
                  type="time"
                  label="조사 기한 시간"
                  value={responseDeadlineTime}
                  labelClassName={styles.visuallyHidden}
                  disabled={false}
                  onChange={setResponseDeadlineTime}
                  onBlur={() => undefined}
                />
              </div>
            </Field.Root>
          </div>

          <Field.Root className={styles.field} required>
            <Field.Label className={styles.fieldLabel}>
              초대 범위 <span className={styles.required}>*</span>
            </Field.Label>
            <fieldset className={styles.inviteOptions}>
              <legend className={styles.inviteLegend}>초대 범위</legend>
              {inviteOptions.map(({ value, label }) => {
                const selected = selectedInviteOptions.includes(value);
                return (
                  <button
                    key={value}
                    className={`${styles.inviteOption} ${selected ? styles.inviteOptionSelected : ''}`}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleInviteOption(value)}
                  >
                    {selected && <span className={styles.inviteOptionCheck}>✓</span>}
                    {label}
                  </button>
                );
              })}
              <span className={styles.inviteCategory}>기수</span>
              <Select.Root
                value={[generation]}
                onValueChange={(values) => {
                  const nextValue = values[0];
                  if (isGenerationValue(nextValue)) {
                    setGeneration(nextValue);
                  }
                }}
              >
                <Select.Trigger className={styles.generationSelect} aria-label="기수 선택">
                  <Select.Value>
                    {generationOptions.find((option) => option.value === generation)?.label}
                  </Select.Value>
                  <Select.SuffixIcon svg={<ChevronDown aria-hidden="true" size={16} />} />
                </Select.Trigger>
                <Select.Positioner>
                  <Select.Content data-seed-color-mode="dark-only">
                    <Select.Group>
                      {generationOptions.map((option) => (
                        <Select.Item key={option.value} value={option.value} label={option.label}>
                          <Select.ItemBody>
                            <Select.ItemLabel />
                          </Select.ItemBody>
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select.Positioner>
                <Select.HiddenSelect />
              </Select.Root>
            </fieldset>
            <p className={styles.inviteDescription}>
              선택한 범위의 회원 앱에 뒤풀이 카드와 미응답 표시가 떠요 · 대상 70명
            </p>
          </Field.Root>

          <div className={styles.maxAttendeesField}>
            <TextField
              label="최대 인원"
              indicator="(선택)"
              suffix="명"
              value={maxAttendees}
              onValueChange={({ value }) => setMaxAttendees(value)}
            >
              <TextFieldInput name="maxAttendees" type="number" placeholder="제한 없음" min={1} />
            </TextField>
          </div>
        </fieldset>

        <footer className={styles.actions}>
          <ActionButton asChild type="button" variant="neutralWeak">
            <Link to="/dining">취소</Link>
          </ActionButton>
          <ActionButton type="submit" variant="brandSolid" className={styles.primaryButton}>
            뒤풀이 만들기
          </ActionButton>
        </footer>
      </form>
    </main>
  );
}
