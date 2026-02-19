"use client";

import {
  useDesktopTranslations,
  useGlobalErrorTranslations,
} from "@/hooks/useTranslations";
import { AppKey } from "@/lib/apps";
import { useDockStore } from "@/stores/useDockStore";
import { useWindowStore } from "@/stores/useWindowStore";
import { truncate } from "lodash";
import { LucideIcon } from "lucide-react";
import React, { useCallback } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/ContextMenu";

type Props = {
  appKey: AppKey;
  app: { shortName: string; icon: LucideIcon; maxInstances: number };
};

function AppIcon({ appKey, app }: Props) {
  const { openApp } = useWindowStore();
  const { removeFromDesktop } = useDockStore();
  const tErrors = useGlobalErrorTranslations();
  const tDesktop = useDesktopTranslations();
  const Icon = app.icon;

  const handleOpenApp = useCallback(() => {
    openApp(appKey, app.maxInstances, tErrors);
  }, [openApp, appKey, app.maxInstances, tErrors]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          className="text-center cursor-pointer hover:opacity-70 w-16"
          onClick={handleOpenApp}
        >
          <div className="w-16 h-16 bg-foreground/20 rounded-lg flex items-center justify-center text-foreground">
            <Icon className="w-8 h-8" />
          </div>
          <span className="text-foreground text-sm">
            {truncate(app.shortName, {
              length: 10,
            })}
          </span>
        </button>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleOpenApp}>
          {tDesktop("open")}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => removeFromDesktop(appKey)}>
          {tDesktop("removeFromDesktop")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default React.memo(AppIcon);
