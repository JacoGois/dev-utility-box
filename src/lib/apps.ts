import { PomodoroApp } from "@/apps/PomodoroApp";
import { Timer } from "lucide-react";

export const apps = {
  Pomodoro: {
    name: "Pomodoro",
    icon: Timer,
    component: PomodoroApp,
  },
  Timer: {
    name: "Timer",
    icon: Timer,
    component: PomodoroApp,
  },
} as const;

export type appsType = typeof apps;

export type AppKey = keyof appsType;
