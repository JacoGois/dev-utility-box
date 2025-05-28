import { Clock, Coffee, Timer } from "lucide-react";

export const MODES = {
  pomodoro: {
    label: "Pomodoro",
    duration: 25 * 60,
    color: "hsl(var(--destructive))",
    icon: Timer,
  },
  shortBreak: {
    label: "Pausa Curta",
    duration: 5 * 60,
    color: "hsl(var(--chart-2))",
    icon: Coffee,
  },
  longBreak: {
    label: "Pausa Longa",
    duration: 15 * 60,
    color: "hsl(var(--primary))",
    icon: Clock,
  },
};

export type Session = {
  mode: keyof typeof MODES;
  completedAt: string;
};

export const TIMER_SVG_RADIUS = 120;
export const CIRCUMFERENCE = 2 * Math.PI * TIMER_SVG_RADIUS;
