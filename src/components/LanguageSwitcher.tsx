"use client";

import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { localeFlags, localeNames } from "@/i18n/config";
import { routing } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LanguageSwitcherProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LanguageSwitcher({
  open: externalOpen,
  onOpenChange,
}: LanguageSwitcherProps = {}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const changeLanguage = (locale: string) => {
    const currentPath = window.location.pathname;
    const pathWithoutLocale =
      currentPath.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
    const newPath = `/${locale}${pathWithoutLocale}`;
    router.push(newPath);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Change language</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="end">
        <div className="space-y-1">
          {routing.locales.map((locale) => (
            <Button
              key={locale}
              variant="ghost"
              className="w-full justify-start text-sm"
              onClick={() => changeLanguage(locale)}
            >
              <span className="mr-2">
                {localeFlags[locale as keyof typeof localeFlags]}
              </span>
              {localeNames[locale as keyof typeof localeNames]}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
