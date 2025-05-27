"use client";

import { AppKey, apps } from "@/lib/apps";
import { useDesktopStore } from "@/stores/useDesktopStore";
import { useDockStore } from "@/stores/useDockStore";
import { useWindowStore } from "@/stores/useWindowStore";
import React from "react";
import AppIcon from "./AppIcon";
import AppWindow from "./AppWindow";

type Props = {
  children?: React.ReactNode;
};

export default function Desktop({ children }: Props) {
  const { background } = useDesktopStore();
  const { openApps } = useWindowStore();
  const { desktopApps } = useDockStore();

  return (
    <div
      className="w-screen h-screen bg-cover overflow-hidden bg-center relative"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="absolute top-4 left-4 flex gap-4 z-10">
        {(desktopApps as AppKey[]).map((key) => {
          const app = apps[key];
          return <AppIcon key={key} appKey={key} app={app} />;
        })}
      </div>

      {openApps.map((instance) => (
        <AppWindow key={instance.id} instance={instance} />
      ))}

      {children}
    </div>
  );
}
