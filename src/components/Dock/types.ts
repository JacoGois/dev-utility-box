import { AppKey } from "@/lib/apps";
import { WindowInstance } from "@/stores/useWindowStore";

export interface DockThemeProps {
  openApps: WindowInstance[];
  dockApps: AppKey[];
  focusStack: string[];
  onToggleLauncher: () => void;
  onAppClick: (appKeyOrInstanceId: string) => void;
}
