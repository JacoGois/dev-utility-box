import { FieldProps } from "@/types/components/form";
import { NumberInput, NumberInputProps } from "../NumberInput";
import { FieldRoot } from "./FieldRoot";

export const NumberField = ({
  name,
  onChange,
  label,
  value,
  className,
  id,
  disabled,
  errorMessage,
  inputClassName,
  decimalScale,
  decimalSeparator,
  thousandSeparator,
  ...props
}: FieldProps & NumberInputProps) => {
  const isInvalid = !!errorMessage;

  return (
    <FieldRoot
      className={className}
      error={isInvalid}
      id={id}
      name={name}
      disabled={disabled}
      label={label}
      errorMessage={errorMessage}
    >
      <NumberInput
        onChange={onChange}
        error={isInvalid}
        value={value}
        id={id ?? name}
        disabled={disabled}
        inputClassName={inputClassName}
        decimalScale={decimalScale}
        decimalSeparator={decimalSeparator}
        thousandSeparator={thousandSeparator}
        {...props}
      />
    </FieldRoot>
  );
};
