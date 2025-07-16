import { cn } from "@/lib/utils";
import { FieldProps } from "@/types/components/form";
import { ErrorMessage } from "../ErrorMessage";
import { Label } from "../Label";

export const FieldRoot = ({
  className,
  error,
  id,
  name,
  disabled,
  label,
  children,
  errorMessage,
}: FieldProps) => {
  return (
    <div className={cn("flex flex-col w-full gap-1.5", className)}>
      {label && (
        <Label error={error} htmlFor={id ?? name} disabled={disabled}>
          {label}
        </Label>
      )}
      {children}
      {error && <ErrorMessage disabled={disabled} message={errorMessage} />}
    </div>
  );
};
