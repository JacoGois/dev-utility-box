"use client";

import { apps } from "@/lib/apps";
import { AppWindowIcon } from "lucide-react";
import { DockThemeProps } from "./types";

export function DockUbuntu({
  dockApps,
  openApps,
  onToggleLauncher,
  onAppClick,
}: DockThemeProps) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-background backdrop-blur-md px-4 py-2 rounded-2xl flex gap-4 items-center z-50 shadow-lg border border-white/10">
      <button onClick={onToggleLauncher}>
        <AppWindowIcon className="w-6 h-6 text-foreground cursor-pointer" />
      </button>

      {dockApps.map((appKey) => {
        const Icon = apps[appKey].icon;
        const appInstances = openApps.filter((w) => w.appKey === appKey);

        return (
          <div
            key={appKey}
            className="relative cursor-pointer"
            onClick={() => onAppClick(appKey)}
          >
            <button>
              <Icon className="w-6 h-6 text-foreground" />
            </button>

            {appInstances.length > 0 && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                {appInstances.map((instance) => (
                  <span
                    key={instance.id}
                    className="w-1.5 h-1.5 bg-primary rounded-full"
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
