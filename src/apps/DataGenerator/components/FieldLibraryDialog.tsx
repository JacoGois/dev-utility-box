"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import { RefObject } from "react";

type FieldLibraryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectField: (fakerMethod: string) => void;
  availableFields: Record<string, Record<string, string>>;
  parentModalContainerRef?: RefObject<HTMLDivElement | null> | null;
};

export function FieldLibraryDialog({
  open,
  onOpenChange,
  onSelectField,
  availableFields,
  parentModalContainerRef,
}: FieldLibraryDialogProps) {
  const handleSelect = (fakerMethod: string) => {
    onSelectField(fakerMethod);
    onOpenChange(false);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-3xl z-[99999999]"
      portalContainer={parentModalContainerRef?.current ?? undefined}
    >
      <CommandInput placeholder="Buscar por qualquer tipo de dado..." />
      <CommandList className="max-h-[60vh] overflow-y-auto">
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 p-2">
          {Object.entries(availableFields).map(([groupName, fields]) => (
            <CommandGroup
              key={groupName}
              heading={groupName}
              className="break-inside-avoid"
            >
              {Object.entries(fields).map(([fieldName, method]) => (
                <CommandItem
                  key={method}
                  value={fieldName}
                  onSelect={() => handleSelect(method)}
                  className="cursor-pointer"
                >
                  {fieldName}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </div>
      </CommandList>
    </CommandDialog>
  );
}
