import { Pomodoro } from "@/apps/Pomodoro";
import { Timer } from "lucide-react";

export const apps = {
  Pomodoro: {
    name: "Pomodoro",
    icon: Timer,
    component: Pomodoro,
    maxInstances: 1,
  },
  Timer: {
    name: "omo",
    icon: Timer,
    component: Pomodoro,
    maxInstances: 3,
  },
} as const;

export type appsType = typeof apps;

export type AppKey = keyof appsType;
