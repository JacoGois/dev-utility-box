"use client";

import { AppKey, apps } from "@/lib/apps";
import { useDesktopStore } from "@/stores/useDesktopStore";
import { useDockStore } from "@/stores/useDockStore";
import { useSpotlightStore } from "@/stores/useSpotlightStore";
import { useWindowStore } from "@/stores/useWindowStore";
import React, { useEffect } from "react";
import AppIcon from "./AppIcon";
import AppWindow from "./AppWindow";
import { SpotlightSearch } from "./SpotlightSearch";

type Props = {
  children?: React.ReactNode;
};

export default function Desktop({ children }: Props) {
  const { background } = useDesktopStore();
  const { openApps } = useWindowStore();
  const { desktopApps } = useDockStore();
  const { openSpotlight, isOpen: isSpotlightOpen } = useSpotlightStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        openSpotlight();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSpotlightOpen]);

  return (
    <div
      className="w-screen h-screen bg-cover overflow-hidden bg-center relative"
      style={{ backgroundImage: background }}
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
      <SpotlightSearch />
    </div>
  );
}
