"use client";

import { AppKey } from "@/lib/apps";
import { useDockStore } from "@/stores/useDockStore";
import { useWindowStore } from "@/stores/useWindowStore";
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
  app: { name: string; icon: LucideIcon };
};

function AppIcon({ appKey, app }: Props) {
  const { openApp } = useWindowStore();
  const { removeFromDesktop } = useDockStore();
  const Icon = app.icon;

  const handleOpenApp = useCallback(() => {
    openApp(appKey);
  }, [openApp, appKey]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          className="text-center cursor-pointer hover:opacity-70"
          onClick={() => openApp(appKey)}
        >
          <div className="w-16 h-16 bg-foreground/20 rounded-lg flex items-center justify-center text-foreground">
            <Icon className="w-8 h-8" />
          </div>
          <span className="text-foreground text-sm">{app.name}</span>
        </button>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleOpenApp}>Abrir</ContextMenuItem>
        <ContextMenuItem onClick={() => removeFromDesktop(appKey)}>
          Remover da Área de Trabalho
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default React.memo(AppIcon);
