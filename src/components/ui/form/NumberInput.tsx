import { InputProps } from "@/types/components/form";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Input } from "./Input";

export type NumberInputProps = NumericFormatProps &
  InputProps & {
    handleChange?: (value: string) => void;
  };

export const NumberInput = ({
  handleChange = () => {},
  inputClassName,
  ...props
}: NumberInputProps) => {
  return (
    <NumericFormat
      decimalScale={undefined}
      decimalSeparator=","
      thousandSeparator="."
      onValueChange={({ value }) => handleChange(value)}
      customInput={Input}
      className={inputClassName}
      {...props}
    />
  );
};
