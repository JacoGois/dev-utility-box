import { cn } from "@/lib/utils";
import { InputProps } from "@/types/components/form";
import { LucideIcon } from "lucide-react";
import { useState } from "react";
import {
  SelectContent,
  SelectItem,
  Select as SelectRoot,
  SelectTrigger,
  SelectValue,
} from "./SelectCore";

export type OptionsList = { label?: string; value: string };

export type OptionsListUF = { name?: string; id: string; uf?: string };

interface SelectProps
  extends Omit<InputProps, "onChange" | "value" | "defaultValue" | "dir"> {
  options: OptionsList[];
  placeholder: string;
  className?: string;
  value?: string;
  onChange: (value: string) => void;
  name?: string;
  id?: string;
  icon?: LucideIcon;
}

export const Select = ({
  options,
  disabled,
  placeholder,
  className,
  value,
  onChange,
  error,
  id,
  name,
  ...props
}: SelectProps) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <SelectRoot
      open={disabled ? false : open}
      onOpenChange={() => setOpen(!open)}
      value={value ? String(value) : undefined}
      onValueChange={(v) => onChange(v)}
      {...props}
    >
      <SelectTrigger
        id={id ?? name}
        className={cn({ "opacity-50 cursor-not-allowed": disabled }, className)}
        error={error}
      >
        {value !== "undefined" ? (
          <SelectValue />
        ) : (
          <span className="text-slate-400 text-lg">{placeholder}</span>
        )}
      </SelectTrigger>
      <SelectContent>
        {options.length === 0 ? (
          <div className="py-6 text-center text-sm">Sem registro</div>
        ) : (
          <>
            {options.map((option, index) => (
              <SelectItem key={index} value={option.value as string}>
                <p className="text-start">{option.label}</p>
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </SelectRoot>
  );
};
