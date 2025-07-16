import { cn } from "@/lib/utils";
import { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  disabled?: boolean;
  error?: boolean;
  htmlFor?: string;
}

export const Label = ({
  htmlFor,
  className,
  error,
  disabled,
  ...props
}: LabelProps) => {
  return (
    <label
      className={cn(
        "text-base font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-paragraph",
        className,
        error && "text-destructive",
        disabled && "cursor-not-allowed opacity-70"
      )}
      htmlFor={htmlFor}
      {...props}
    />
  );
};
