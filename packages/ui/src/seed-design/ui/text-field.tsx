/**
 * @file ui:text-field
 * @requires @seed-design/react@^2.0.0 || ^3.0.0
 **/

'use client';

import { IconExclamationmarkCircleFill } from '@karrotmarket/react-monochrome-icon';
import {
  Field as SeedField,
  PrefixIcon,
  TextField as SeedTextField,
  useTextFieldWithGraphemes,
  VisuallyHidden,
  type UseTextFieldWithGraphemesParams,
} from '@seed-design/react';
import type { ReactNode, Ref } from 'react';

export type TextFieldProps = Omit<
  SeedTextField.RootProps,
  'prefix' | 'onValueChange' | 'asChild'
> & {
  label?: ReactNode;
  /**
   * @default "medium"
   */
  labelWeight?: SeedField.LabelProps['weight'];

  indicator?: ReactNode;

  prefixIcon?: ReactNode;
  prefix?: ReactNode;
  suffixIcon?: ReactNode;
  suffix?: ReactNode;

  description?: ReactNode;
  errorMessage?: ReactNode;

  hideCharacterCount?: boolean;
  maxGraphemeCount?: number;
  showRequiredIndicator?: boolean;

  ref?: Ref<HTMLDivElement>;
  fieldRef?: Ref<HTMLDivElement>;

  onValueChange?: UseTextFieldWithGraphemesParams['onValueChange'];
};

/**
 * 라벨이 없으면 입력 요소에 `aria-label` 또는 `aria-labelledby`를 전달합니다.
 * @see https://seed-design.io/react/components/text-field-input
 */
export function TextField({
  prefix,
  prefixIcon,
  suffix,
  suffixIcon,
  label,
  labelWeight,
  indicator,
  description,
  errorMessage,
  hideCharacterCount,
  children,

  // field props
  required,
  disabled,
  invalid,
  readOnly,
  name,

  showRequiredIndicator,

  // useTextFieldWithGraphemes params
  value,
  defaultValue,
  onValueChange,
  maxGraphemeCount,

  ref,
  fieldRef,

  ...otherProps
}: TextFieldProps) {
  const { textFieldRootProps, counterProps } = useTextFieldWithGraphemes({
    value,
    defaultValue,
    onValueChange,
    maxGraphemeCount,
  });

  const renderHeader = Boolean(label) || Boolean(indicator);
  const renderDescription = Boolean(description);
  const renderErrorMessage = Boolean(errorMessage) && Boolean(invalid);
  const renderGraphemeCount = !hideCharacterCount && maxGraphemeCount !== undefined;
  const renderFooter = renderDescription || renderErrorMessage || renderGraphemeCount;

  return (
    <SeedField.Root
      required={required}
      disabled={disabled}
      invalid={invalid}
      readOnly={readOnly}
      name={name}
      ref={fieldRef}
    >
      {renderHeader && (
        <SeedField.Header>
          <SeedField.Label weight={labelWeight}>
            {label}
            {showRequiredIndicator && <SeedField.RequiredIndicator />}
            {indicator && <SeedField.IndicatorText>{indicator}</SeedField.IndicatorText>}
          </SeedField.Label>
        </SeedField.Header>
      )}
      <SeedTextField.Root ref={ref} {...otherProps} {...textFieldRootProps}>
        {prefixIcon && <SeedTextField.PrefixIcon svg={prefixIcon} />}
        {prefix && <SeedTextField.PrefixText>{prefix}</SeedTextField.PrefixText>}
        {children}
        {suffix && <SeedTextField.SuffixText>{suffix}</SeedTextField.SuffixText>}
        {suffixIcon && <SeedTextField.SuffixIcon svg={suffixIcon} />}
      </SeedTextField.Root>
      {renderFooter && (
        <SeedField.Footer>
          {renderDescription &&
            (renderErrorMessage ? (
              <VisuallyHidden asChild>
                <SeedField.Description>{description}</SeedField.Description>
              </VisuallyHidden>
            ) : (
              <SeedField.Description>{description}</SeedField.Description>
            ))}
          {renderErrorMessage && (
            <SeedField.ErrorMessage>
              <PrefixIcon svg={<IconExclamationmarkCircleFill />} />
              {errorMessage}
            </SeedField.ErrorMessage>
          )}
          {renderGraphemeCount && <SeedField.CharacterCount {...counterProps} />}
        </SeedField.Footer>
      )}
    </SeedField.Root>
  );
}

export type TextFieldInputProps = SeedTextField.InputProps;

/**
 * @see https://seed-design.io/react/components/text-field-input
 */
export const TextFieldInput = SeedTextField.Input;

export type TextFieldTextareaProps = SeedTextField.TextareaProps;

/**
 * @see https://seed-design.io/react/components/text-field-textarea
 */
export const TextFieldTextarea = SeedTextField.Textarea;

/**
 * This file is a snippet from SEED Design, helping you get started quickly with @seed-design/* packages.
 * You can extend this snippet however you want.
 */
