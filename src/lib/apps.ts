import { MarkdownNotes } from "@/apps/MarkdownNotes";
import { Pomodoro } from "@/apps/Pomodoro";
import { NotebookPen, Timer } from "lucide-react";

export const apps = {
  Pomodoro: {
    name: "Pomodoro",
    icon: Timer,
    component: Pomodoro,
    maxInstances: 1,
  },
  MarkdownNotes: {
    name: "Notas Markdown",
    icon: NotebookPen,
    component: MarkdownNotes,
    maxInstances: 1,
  },
} as const;

export type appsType = typeof apps;

export type AppKey = keyof appsType;
