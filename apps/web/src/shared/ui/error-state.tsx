/** 회원 웹의 오류 표시만 담당한다. 조회 재시도와 인증·탐색 정책은 호출자가 소유한다. */
import { ResultSection } from '@yapp-plus/ui';
import { graphic, root } from './error-state.css';

/** 안전한 표시 문구와 복구 행동을 받는다. 원본 Error·요청 정보는 받거나 DOM에 전달하지 않는다. */
export type ErrorStateProps = {
  variant: 'page' | 'section';
  title?: string;
  description?: string;
  titleAs?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  onRetry: () => void;
  retryLabel?: string;
  secondaryAction?: { label: string; href: string };
};

/** 페이지형에만 장식 그림을 표시한다. 보조 링크는 최종 앱 복구처럼 명시한 경우에만 제공한다. */
export function ErrorState({
  variant,
  title = '앗, 오류가 발생했어요!',
  description = '잠시 후 다시 시도해 주세요.',
  titleAs = 'h2',
  onRetry,
  retryLabel = '다시 시도',
  secondaryAction,
}: ErrorStateProps) {
  return (
    <ResultSection
      className={root}
      role="alert"
      size={variant === 'page' ? 'large' : 'medium'}
      title={title}
      titleAs={titleAs}
      description={description}
      asset={
        variant === 'page' ? (
          <img
            className={graphic}
            src="/images/notices/graphic-error.svg"
            width={350}
            height={170}
            alt=""
          />
        ) : undefined
      }
      primaryActionProps={{ type: 'button', children: retryLabel, onClick: onRetry }}
      secondaryActionProps={
        secondaryAction
          ? {
              asChild: true,
              children: <a href={secondaryAction.href}>{secondaryAction.label}</a>,
            }
          : undefined
      }
    />
  );
}
