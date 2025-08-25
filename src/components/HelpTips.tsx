"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { shortcuts } from "@/lib/shortcuts";
import { HelpCircle } from "lucide-react";

export function HelpTips() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button>
          <HelpCircle className="h-7 w-7 hover:opacity-70 cursor-pointer" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 mb-2" side="top" align="end">
        <div>
          <div className="space-y-1">
            <h4 className="font-medium leading-none">Dicas e Atalhos</h4>
            <p className="text-base text-muted-foreground">
              Use estes atalhos para navegar.
            </p>
          </div>
          <hr className="my-3" />
          <div className="grid gap-2">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.description}
                className="grid grid-cols-[1fr_auto] items-center gap-4"
              >
                <span className="text-sm text-muted-foreground">
                  {shortcut.description}
                </span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key) => (
                    <kbd
                      key={key}
                      className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
