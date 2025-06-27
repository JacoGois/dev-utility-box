"use client";

import { ThemedComponent } from "@/components/ThemedComponent";
import { AppKey } from "@/lib/apps";
import { useDockStore } from "@/stores/useDockStore";
import { useWindowStore } from "@/stores/useWindowStore";
import { dockThemeRegistry } from "./themeRegistry";
import { DockThemeProps } from "./types";

export function Dock() {
  const { dockApps, toggleLauncher } = useDockStore();
  const { openApps, minimizedApps, focusStack, openApp, restoreApp, focusApp } =
    useWindowStore();

  const handleAppClick = (appKeyOrInstanceId: string) => {
    const instanceById = openApps.find((w) => w.id === appKeyOrInstanceId);
    if (instanceById) {
      if (minimizedApps.includes(instanceById.id)) {
        restoreApp(instanceById.id);
      } else {
        focusApp(instanceById.id);
      }
      return;
    }

    const appKey = appKeyOrInstanceId as AppKey;
    const appInstances = openApps.filter((w) => w.appKey === appKey);
    const minimizedInstances = minimizedApps.filter((id) =>
      appInstances.some((w) => w.id === id)
    );

    if (appInstances.length === 0) {
      openApp(appKey);
    } else if (minimizedInstances.length > 0) {
      restoreApp(minimizedInstances[0]);
    } else {
      focusApp(appInstances[0].id);
    }
  };

  const dockProps: DockThemeProps = {
    dockApps,
    openApps,
    focusStack,
    onToggleLauncher: toggleLauncher,
    onAppClick: handleAppClick,
  };

  return (
    <ThemedComponent<DockThemeProps>
      registry={dockThemeRegistry}
      {...dockProps}
    />
  );
}
