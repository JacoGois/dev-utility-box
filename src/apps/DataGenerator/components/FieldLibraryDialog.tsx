"use client";

import {
  Command,
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
  availableFields: Record<string, string>;
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
      className="p-0 z-[9999999]"
      portalContainer={parentModalContainerRef?.current ?? undefined}
      open={open}
      onOpenChange={onOpenChange}
    >
      <Command>
        <CommandInput placeholder="Buscar um tipo de dado..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Campos Disponíveis">
            {Object.entries(availableFields).map(([name, method]) => (
              <CommandItem
                key={method}
                value={name}
                onSelect={() => handleSelect(method)}
                className="cursor-pointer"
              >
                {name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
