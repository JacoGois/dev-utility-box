import { FieldProps } from "@/types/components/form";
import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { Input } from "../Input";
import { FieldRoot } from "./FieldRoot";

export const PasswordField = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, className, id, disabled, errorMessage, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
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
        <div className="relative flex items-center">
          <Input
            error={isInvalid}
            id={id ?? name}
            disabled={disabled}
            type={visible ? "text" : "password"}
            placeholder="•••••••••"
            ref={ref}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute cursor-pointer right-3 text-primary hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={visible ? "Esconder senha" : "Mostrar senha"}
            disabled={disabled}
          >
            {visible ? (
              <Eye size={18} className={isInvalid ? "text-destructive" : ""} />
            ) : (
              <EyeOff
                size={18}
                className={isInvalid ? "text-destructive" : ""}
              />
            )}
          </button>
        </div>
      </FieldRoot>
    );
  }
);

PasswordField.displayName = "PasswordField";
