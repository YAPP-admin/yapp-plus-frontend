/**
 * @file ui:text-field
 * @requires @seed-design/react@^2.0.0 || ^3.0.0
 **/

'use client';

import * as React from 'react';
import {
  TextField as SeedTextField,
  Field as SeedField,
  type UseTextFieldWithGraphemesParams,
  useTextFieldWithGraphemes,
  VisuallyHidden,
  PrefixIcon,
} from '@seed-design/react';
import { IconExclamationmarkCircleFill } from '@karrotmarket/react-monochrome-icon';

export type TextFieldProps = Omit<
  SeedTextField.RootProps,
  'prefix' | 'onValueChange' | 'asChild'
> & {
  label?: React.ReactNode;
  /**
   * @default "medium"
   */
  labelWeight?: SeedField.LabelProps['weight'];

  indicator?: React.ReactNode;

  prefixIcon?: React.ReactNode;
  prefix?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  suffix?: React.ReactNode;

  description?: React.ReactNode;
  errorMessage?: React.ReactNode;

  hideCharacterCount?: boolean;
  maxGraphemeCount?: number;
  showRequiredIndicator?: boolean;

  fieldRef?: React.Ref<HTMLDivElement>;

  onValueChange?: UseTextFieldWithGraphemesParams['onValueChange'];
};

/**
 * @see https://seed-design.io/react/components/text-field-input
 */
export const TextField = React.forwardRef<HTMLDivElement, TextFieldProps>(
  (
    {
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

      fieldRef,

      ...otherProps
    },
    ref,
  ) => {
    const { textFieldRootProps, counterProps } = useTextFieldWithGraphemes({
      value,
      defaultValue,
      onValueChange,
      maxGraphemeCount,
    });

    const headerContent = label ?? indicator;
    const shouldRenderDescription = Boolean(description);
    const shouldRenderErrorMessage = Boolean(errorMessage && invalid);
    const shouldRenderGraphemeCount = !hideCharacterCount && maxGraphemeCount !== undefined;
    const shouldRenderFooter =
      shouldRenderDescription || shouldRenderErrorMessage || shouldRenderGraphemeCount;

    return (
      <SeedField.Root
        required={required}
        disabled={disabled}
        invalid={invalid}
        readOnly={readOnly}
        name={name}
        ref={fieldRef}
      >
        {headerContent && (
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
        {shouldRenderFooter && (
          <SeedField.Footer>
            {shouldRenderDescription &&
              (shouldRenderErrorMessage ? (
                <VisuallyHidden asChild>
                  <SeedField.Description>{description}</SeedField.Description>
                </VisuallyHidden>
              ) : (
                <SeedField.Description>{description}</SeedField.Description>
              ))}
            {shouldRenderErrorMessage && (
              <SeedField.ErrorMessage>
                <PrefixIcon svg={<IconExclamationmarkCircleFill />} />
                {errorMessage}
              </SeedField.ErrorMessage>
            )}
            {shouldRenderGraphemeCount && <SeedField.CharacterCount {...counterProps} />}
          </SeedField.Footer>
        )}
      </SeedField.Root>
    );
  },
);
TextField.displayName = 'TextField';

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
