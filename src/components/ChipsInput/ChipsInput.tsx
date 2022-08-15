import * as React from "react";
import { HasAlign, HasRef, HasRootRef } from "../../types";
import { FormField, FormFieldProps } from "../FormField/FormField";
import { classNames } from "../../lib/classNames";
import { Chip, ChipProps } from "../Chip/Chip";
import { noop } from "../../lib/utils";
import { useChipsInput } from "../../hooks/useChipsInput";
import { useAdaptivity } from "../../hooks/useAdaptivity";
import { prefixClass } from "../../lib/prefixClass";
import { useExternRef } from "../../hooks/useExternRef";
import "./ChipsInput.css";

export type ChipsInputValue = string | number;

export interface ChipsInputOption {
  value?: ChipsInputValue;
  label?: string;
  [otherProp: string]: any;
}

export interface RenderChip<Option extends ChipsInputOption> extends ChipProps {
  label: string;
  option: Option;
  disabled: boolean;
}

export interface ChipsInputProps<Option extends ChipsInputOption>
  extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "value" | "onChange"
    >,
    HasRef<HTMLInputElement>,
    HasRootRef<HTMLDivElement>,
    HasAlign,
    FormFieldProps {
  value: Option[];
  inputValue?: string;
  onChange?: (o: Option[]) => void;
  onInputChange?: (e?: React.ChangeEvent<HTMLInputElement>) => void;
  getOptionValue?: (o?: Option) => ChipsInputValue;
  getOptionLabel?: (o?: Option) => string;
  getNewOptionData?: (v?: ChipsInputValue, l?: string) => Option;
  renderChip?: (props?: RenderChip<Option>) => React.ReactNode;
  inputAriaLabel?: string;
}

export const chipsInputDefaultProps: ChipsInputProps<any> = {
  type: "text",
  onChange: noop,
  onInputChange: noop,
  onKeyDown: noop,
  onBlur: noop,
  onFocus: noop,
  value: [],
  inputValue: "",
  inputAriaLabel: "Введите ваше значение...",
  getOptionValue: (option) => option.value,
  getOptionLabel: (option) => option.label,
  getNewOptionData: (_, label) => ({
    value: label,
    label,
  }),
  renderChip(props) {
    if (!props) {
      return null;
    }

    const { disabled, value, label, ...rest } = props;
    return (
      <Chip value={value} removable={!disabled} {...rest}>
        {label}
      </Chip>
    );
  },
};

export type ChipsInputBaseProps<Option extends ChipsInputOption> = Omit<
  ChipsInputProps<Option>,
  "style" | "className" | "before" | "after" | "getRootRef"
>;

export const ChipsInputBase = <Option extends ChipsInputOption>(
  props: ChipsInputBaseProps<Option>
) => {
  const propsWithDefault = { ...chipsInputDefaultProps, ...props };
  const {
    value,
    onChange,
    onInputChange,
    onKeyDown,
    onBlur,
    onFocus,
    children,
    inputValue,
    getRef,
    placeholder,
    getOptionValue,
    getOptionLabel,
    getNewOptionData,
    renderChip,
    inputAriaLabel,
    ...restProps
  } = propsWithDefault;
  const { sizeY } = useAdaptivity();

  const [focused, setFocused] = React.useState(false);
  const {
    fieldValue,
    addOptionFromInput,
    removeOption,
    selectedOptions,
    handleInputChange,
  } = useChipsInput(propsWithDefault);
  const inputRef = useExternRef(getRef);

  const isDisabled = restProps.disabled || restProps.readOnly;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }

    onKeyDown!(e);

    if (
      e.key === "Backspace" &&
      !e.defaultPrevented &&
      !fieldValue &&
      selectedOptions.length
    ) {
      removeOption(
        getOptionValue!(selectedOptions[selectedOptions.length - 1])
      );
      e.preventDefault();
    }

    if (e.key === "Enter" && !e.defaultPrevented && fieldValue) {
      addOptionFromInput();
      e.preventDefault();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (focused) {
      setFocused(false);
    }
    onBlur!(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!focused) {
      setFocused(true);
    }
    onFocus!(e);
  };

  const handleChipRemove = (
    _: React.MouseEvent | undefined,
    value: ChipsInputValue | undefined
  ) => {
    if (value !== undefined) {
      removeOption(value);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }

    if (inputRef?.current !== null && !focused) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      vkuiClass={classNames("ChipsInput", `ChipsInput--sizeY-${sizeY}`)}
      onClick={handleClick}
      role="presentation"
    >
      {selectedOptions.map((option: Option) => {
        const value = getOptionValue!(option);
        const label = getOptionLabel!(option);

        return (
          <React.Fragment key={`${typeof value}-${value}`}>
            {renderChip!({
              option,
              value,
              label,
              onRemove: handleChipRemove,
              disabled: Boolean(restProps.disabled),
              className: prefixClass("ChipsInput__chip"),
            })}
          </React.Fragment>
        );
      })}
      <label vkuiClass="ChipsInput__label" aria-label={inputAriaLabel}>
        <input
          ref={inputRef}
          value={fieldValue}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-autocomplete="list"
          vkuiClass="ChipsInput__el"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={selectedOptions.length ? undefined : placeholder}
          {...restProps}
        />
      </label>
    </div>
  );
};

/**
 * @see https://vkcom.github.io/VKUI/#/ChipsInput
 */
export const ChipsInput = <Option extends ChipsInputOption>({
  style,
  className,
  getRootRef,
  before,
  after,
  ...restProps
}: ChipsInputProps<Option>) => {
  return (
    <FormField
      getRootRef={getRootRef}
      vkuiClass="ChipsInput__wrapper"
      className={className}
      style={style}
      disabled={restProps.disabled}
      before={before}
      after={after}
      role="application"
      aria-disabled={restProps.disabled}
      aria-readonly={restProps.readOnly}
    >
      <ChipsInputBase {...restProps} />
    </FormField>
  );
};
