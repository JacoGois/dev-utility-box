import { CodeSnippets } from "@/apps/CodeSnippets";
import { MarkdownNotes } from "@/apps/MarkdownNotes";
import { Pomodoro } from "@/apps/Pomodoro";
import { Code2, NotebookPen, Timer } from "lucide-react";

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
  CodeSnippets: {
    name: "Snippets de Código",
    icon: Code2,
    component: CodeSnippets,
    maxInstances: 1,
  },
} as const;

export type appsType = typeof apps;

export type AppKey = keyof appsType;
