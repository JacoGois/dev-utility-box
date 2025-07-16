import { FieldProps } from "@/types/components/form";
import * as React from "react";
import { Input } from "../Input";
import { FieldRoot } from "./FieldRoot";

export const TextField = React.forwardRef<HTMLInputElement, FieldProps>(
  (
    { label, className, id, disabled, errorMessage, inputClassName, ...props },
    ref
  ) => {
    const isInvalid = !!errorMessage;
    const { name } = props;

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
        <Input
          error={isInvalid}
          id={id ?? name}
          disabled={disabled}
          type="text"
          className={inputClassName}
          ref={ref}
          {...props}
        />
      </FieldRoot>
    );
  }
);

TextField.displayName = "TextField";
