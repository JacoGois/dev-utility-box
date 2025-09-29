"use client";

import { useDesktopTranslations } from "@/hooks/useTranslations";
import { AppKey, createApps } from "@/lib/apps";
import { useDesktopStore } from "@/stores/useDesktopStore";
import { useDockStore } from "@/stores/useDockStore";
import { useSpotlightStore } from "@/stores/useSpotlightStore";
import { useWindowStore } from "@/stores/useWindowStore";
import React, { useEffect, useState } from "react";
import AppIcon from "./AppIcon";
import AppWindow from "./AppWindow";
import { HelpTips } from "./HelpTips";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SpotlightSearch } from "./SpotlightSearch";

type Props = {
  children?: React.ReactNode;
};

export default function Desktop({ children }: Props) {
  const { background } = useDesktopStore();
  const { openApps } = useWindowStore();
  const { desktopApps, toggleLauncher } = useDockStore();
  const { openSpotlight, isOpen: isSpotlightOpen } = useSpotlightStore();
  const [isLanguageSwitcherOpen, setIsLanguageSwitcherOpen] = useState(false);
  const t = useDesktopTranslations();
  const apps = createApps(t);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        openSpotlight();
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "m") {
        event.preventDefault();
        toggleLauncher();
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "l") {
        event.preventDefault();
        setIsLanguageSwitcherOpen(true);
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

      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher
          open={isLanguageSwitcherOpen}
          onOpenChange={setIsLanguageSwitcherOpen}
        />
      </div>

      {openApps.map((instance) => (
        <AppWindow key={instance.id} instance={instance} />
      ))}

      <div className="absolute bottom-4 right-4 z-2">
        <HelpTips />
      </div>

      {children}
      <SpotlightSearch />
    </div>
  );
}
