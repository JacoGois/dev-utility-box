"use client";

import { useDesktopTranslations } from "@/hooks/useTranslations";
import { createApps } from "@/lib/apps";
import { cn } from "@/lib/utils";
import { AppWindow, Clock, Volume2 } from "lucide-react";
import { DockThemeProps } from "./types";

export function DockWindowsXP({
  openApps,
  focusStack,
  onToggleLauncher,
  onAppClick,
}: DockThemeProps) {
  const t = useDesktopTranslations();
  const apps = createApps(t);
  const focusedAppId = focusStack[focusStack.length - 1];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 bg-gradient-to-b from-[#275dcf] to-[#2493f3] flex items-center justify-between z-50 border-t border-[#4186E2]">
      <button
        onClick={onToggleLauncher}
        className="h-full my-auto rounded-r-[10px] flex items-center shadow-2xl px-3 gap-3 bg-accent hover:brightness-110 active:brightness-95 cursor-pointer"
      >
        <AppWindow className="text-white" />
        <span
          className="font-bold text-lg italic text-white"
          style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
        >
          iniciar
        </span>
      </button>

      <div className="flex-1 h-full flex items-center gap-1.5 px-2 overflow-x-auto">
        {openApps.map((instance) => {
          const app = apps[instance.appKey];
          const isFocused = instance.id === focusedAppId;
          const Icon = app.icon;

          return (
            <button
              key={instance.id}
              onClick={() => onAppClick(instance.id)}
              className={cn(
                "h-[26px] flex items-center gap-2 px-2 max-w-40 rounded-sm text-white text-xs font-semibold shadow-sm",
                isFocused
                  ? "bg-gradient-to-b from-[#1344A3] to-[#1E7BDC] border-t border-l border-b border-r border-white/80"
                  : "bg-gradient-to-b from-[#3E79DC] to-[#50A4F8] border-t border-l border-b border-r border-[#00000080]",
                "hover:brightness-110 active:brightness-95"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate">{app.shortName}</span>
            </button>
          );
        })}
      </div>

      <div className="h-full flex items-center px-2 bg-gradient-to-b from-[#1C79F2] to-[#53A8F6] border-l-2 border-[#1264D0]">
        <Volume2 className="w-4 h-4 text-white" />
        <Clock className="w-4 h-4 text-white ml-2" />
        <span className="text-xs text-white ml-1 font-sans">
          {new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
