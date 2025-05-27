"use client";

import { AppKey } from "@/lib/apps";
import { useWindowStore } from "@/stores/useWindowStore";
import { LucideIcon } from "lucide-react";

type Props = {
  appKey: AppKey;
  app: { name: string; icon: LucideIcon };
};

export default function AppIcon({ appKey, app }: Props) {
  const { openApp } = useWindowStore();
  const Icon = app.icon;

  return (
    <div className="text-center cursor-pointer" onClick={() => openApp(appKey)}>
      <div className="w-16 h-16 bg-foreground/20 rounded-lg flex items-center justify-center text-foreground">
        <Icon className="w-8 h-8" />
      </div>
      <span className="text-foreground text-sm">{app.name}</span>
    </div>
  );
}
