"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { AppKey, apps, appsType } from "@/lib/apps";
import { useDockStore } from "@/stores/useDockStore";
import { useWindowStore } from "@/stores/useWindowStore";
import {
  // Dock as DockIcon,
  Monitor,
} from "lucide-react";

export function AppLauncher() {
  const {
    isAppLauncherOpen,
    toggleLauncher,
    //  addToDock,
    addToDesktop,
  } = useDockStore();
  const { openApp } = useWindowStore();

  return (
    <Dialog open={isAppLauncherOpen} onOpenChange={toggleLauncher}>
      <DialogContent className="max-w-4xl z-[99999]">
        <DialogHeader>
          <DialogTitle>Todos os Aplicativos</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-5 gap-4 pt-4">
          {(Object.entries(apps) as [AppKey, appsType[AppKey]][]).map(
            ([key, app]) => {
              const Icon = app.icon;

              return (
                <div
                  key={key}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <div
                    className="flex flex-col gap-2 items-center cursor-pointer hover:opacity-70"
                    onClick={() => {
                      openApp(key);
                      toggleLauncher();
                    }}
                  >
                    <div className="w-16 h-16 bg-muted flex items-center justify-center rounded-lg">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-medium">{app.name}</div>
                  </div>
                  <div className="flex gap-2">
                    {/* <button
                      onClick={() => addToDock(key)}
                      title="Adicionar ao Dock"
                      className="bg-card cursor-pointer hover:opacity-70 p-1 rounded-md"
                    >
                      <DockIcon className="w-4 h-4" />
                    </button> */}
                    <button
                      onClick={() => addToDesktop(key)}
                      title="Adicionar à Área de Trabalho"
                      className="bg-card cursor-pointer hover:opacity-70 p-1 rounded-md"
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
