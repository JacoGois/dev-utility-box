import { cn } from "@/lib/utils";
import { AlertCircle, LucideIcon } from "lucide-react";

export interface ErrorMessageProp {
  message: string | undefined;
  className?: string | undefined;
  icon?: LucideIcon;
  disabled?: boolean;
}

export const ErrorMessage = ({
  message,
  disabled,
  icon = AlertCircle,
  className,
}: ErrorMessageProp) => {
  const IconElement = icon;
  return (
    message && (
      <p
        className={cn(
          "flex flex-row text-sm items-center gap-1 text-destructive",
          className,
          {
            "cursor-not-allowed opacity-70": disabled,
          }
        )}
      >
        <IconElement size="12px" />
        {message}
      </p>
    )
  );
};
