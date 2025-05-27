"use client";

import { apps } from "@/lib/apps";
import { cn } from "@/lib/utils";
import { useDockStore } from "@/stores/useDockStore";
import { useWindowStore } from "@/stores/useWindowStore";
import { AppWindowIcon } from "lucide-react";

export function Dock() {
  const { dockApps, toggleLauncher } = useDockStore();
  const { openApps, openApp, minimizedApps, restoreApp } = useWindowStore();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-background backdrop-blur-md px-4 py-2 rounded-2xl flex gap-4 items-center z-50">
      <button onClick={toggleLauncher}>
        <AppWindowIcon className="w-6 h-6 text-foreground cursor-pointer" />
      </button>

      {dockApps.map((appKey) => {
        const Icon = apps[appKey].icon;
        const appInstances = openApps.filter((w) => w.appKey === appKey);

        const minimizedInstances = minimizedApps.filter((id) =>
          appInstances.some((w) => w.id === id)
        );
        const hasHiddenInstance = minimizedInstances.length > 0;

        const handleClick = () => {
          if (appInstances.length === 0) {
            openApp(appKey);
          } else if (hasHiddenInstance) {
            const toRestore = minimizedInstances[minimizedInstances.length - 1];
            restoreApp(toRestore);
          }
        };

        return (
          <div
            key={appKey}
            className={cn("relative cursor-pointer", {
              "flex items-center": appInstances.length === 0,
            })}
          >
            <button onClick={handleClick}>
              <Icon className="w-6 h-6 text-foreground" />
            </button>

            {appInstances.length > 0 && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
                {appInstances.map((instance) => (
                  <span
                    key={instance.id}
                    className="w-1.5 h-1.5 bg-green-500 rounded-full"
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
