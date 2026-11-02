/** 팀 생성 입력과 다음 단계의 회원 선택 영역을 제공한다. 실제 생성은 아직 연결하지 않는다. */
import { type FormEventHandler, type KeyboardEventHandler } from 'react';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import { Dialog, Portal } from '@seed-design/react';
import { ActionButton, TextField, TextFieldInput } from '@yapp-plus/ui';
import { X } from 'lucide-react';
import {
  createTeamDraftSchema,
  getMemberByActivityId,
  teamMappingPartLabels,
  type TeamDraftValues,
  type TeamMappingPart,
  type TeamMappingSnapshot,
} from '~/features/team-management';
import * as styles from './team-create-dialog.css';
import { TeamMemberSearch } from './team-member-search';

/** 생성 모달의 화면 상태와 초안 변경을 부모에 전달하는 입력 계약이다. */
type TeamCreateDialogProps = {
  snapshot: TeamMappingSnapshot;
  onClose: () => void;
  onCreate?: (values: TeamDraftValues) => void;
};

const initialValues: TeamDraftValues = {
  name: '',
  serviceName: '',
  memberActivityIds: [],
};

const teamPartOrder: readonly TeamMappingPart[] = [
  'pm',
  'design',
  'android',
  'ios',
  'web',
  'server',
];

/** 아직 연결하지 않은 생성 제출이 Enter로 실행되지 않도록 막는다. */
const preventEnter: KeyboardEventHandler<HTMLInputElement> = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
};

/** TanStack Form과 Standard Schema 오류를 입력 컴포넌트 문구로 변환한다. */
function getFieldErrorMessage(errors: readonly unknown[]): string | undefined {
  const message = errors
    .map((error) => {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        return String(error.message);
      }
      return String(error);
    })
    .join(' ');

  return message || undefined;
}

/** 팀 생성 입력 모달입니다. 회원 선택은 7단계에서 이 영역에 연결합니다. */
export function TeamCreateDialog({ snapshot, onClose, onCreate }: TeamCreateDialogProps) {
  const form = useForm({
    defaultValues: initialValues,
    validationLogic: revalidateLogic({ mode: 'blur', modeAfterSubmission: 'change' }),
    validators: {
      onDynamic: createTeamDraftSchema(snapshot),
    },
    onSubmit: ({ value }) => onCreate?.(value),
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void form.handleSubmit();
  };

  return (
    <Dialog.Root
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content className={styles.dialog} data-seed-color-mode="dark-only">
            <Dialog.Header>
              <Dialog.Title>팀 만들기</Dialog.Title>
              <Dialog.Description>
                팀명과 서비스명을 입력하고 회원을 선택해 주세요.
              </Dialog.Description>
              <Dialog.CloseButton aria-label="닫기">
                <X size={20} aria-hidden="true" />
              </Dialog.CloseButton>
            </Dialog.Header>
            <form
              className={styles.form}
              aria-label="팀 생성 입력"
              noValidate
              onSubmit={handleSubmit}
            >
              <Dialog.Body className={styles.body}>
                <div className={styles.fields}>
                  <form.Field name="name">
                    {(field) => (
                      <TextField
                        label="팀명"
                        required
                        showRequiredIndicator
                        value={field.state.value}
                        invalid={field.state.meta.errors.length > 0}
                        errorMessage={getFieldErrorMessage(field.state.meta.errors)}
                        onValueChange={({ value }) => field.handleChange(value)}
                      >
                        <TextFieldInput
                          name="team-name"
                          autoComplete="off"
                          onBlur={field.handleBlur}
                          onKeyDown={preventEnter}
                        />
                      </TextField>
                    )}
                  </form.Field>
                  <form.Field name="serviceName">
                    {(field) => (
                      <TextField
                        label="서비스명 (선택)"
                        value={field.state.value}
                        onValueChange={({ value }) => field.handleChange(value)}
                      >
                        <TextFieldInput
                          name="service-name"
                          autoComplete="off"
                          onKeyDown={preventEnter}
                        />
                      </TextField>
                    )}
                  </form.Field>
                </div>

                <form.Field name="memberActivityIds">
                  {(field) => {
                    const selectedMembers = field.state.value.flatMap((activityId) => {
                      const member = getMemberByActivityId(snapshot, activityId);
                      return member === undefined ? [] : [member];
                    });
                    const partCounts = selectedMembers.reduce<Record<TeamMappingPart, number>>(
                      (counts, member) => {
                        counts[member.part] += 1;
                        return counts;
                      },
                      { pm: 0, design: 0, android: 0, ios: 0, web: 0, server: 0 },
                    );
                    const composition = teamPartOrder
                      .filter((part) => partCounts[part] > 0)
                      .map((part) => `${teamMappingPartLabels[part]} ${partCounts[part]}`)
                      .join(' · ');

                    return (
                      <section
                        className={styles.memberSection}
                        aria-labelledby="team-create-members-title"
                      >
                        <div className={styles.memberHeader}>
                          <div>
                            <h3 id="team-create-members-title" className={styles.memberTitle}>
                              선택 회원
                            </h3>
                            <p className={styles.memberDescription}>
                              {composition.length > 0
                                ? `직군 구성 · ${composition}`
                                : '팀원을 1명 이상 추가하세요.'}
                            </p>
                          </div>
                          <span className={styles.memberCount}>{field.state.value.length}명</span>
                        </div>
                        <TeamMemberSearch
                          snapshot={snapshot}
                          selectedActivityIds={field.state.value}
                          onSelect={(activityId) =>
                            field.handleChange([...field.state.value, activityId])
                          }
                          onRemove={(activityId) =>
                            field.handleChange(
                              field.state.value.filter((selectedId) => selectedId !== activityId),
                            )
                          }
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p>{getFieldErrorMessage(field.state.meta.errors)}</p>
                        )}
                      </section>
                    );
                  }}
                </form.Field>
              </Dialog.Body>
              <Dialog.Footer className={styles.footer}>
                <ActionButton type="button" variant="neutralWeak" onClick={onClose}>
                  취소
                </ActionButton>
                <ActionButton
                  type="submit"
                  variant="neutralSolid"
                  disabled
                  aria-label="팀 만들기 (준비 중)"
                >
                  팀 만들기 (준비 중)
                </ActionButton>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
