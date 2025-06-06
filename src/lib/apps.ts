import { CodeSnippets } from "@/apps/CodeSnippets";
import { CommandCenter } from "@/apps/CommandCenter";
import { JSONTools } from "@/apps/JSONTools";
import { KanbanBoard } from "@/apps/KanbanBoard";
import { KnowledgeBase } from "@/apps/KnowledgeBase";
import { MarkdownNotes } from "@/apps/MarkdownNotes";
import { Pomodoro } from "@/apps/Pomodoro";
import {
  Braces,
  Brain,
  Code2,
  Kanban,
  NotebookPen,
  TerminalSquare,
  Timer,
} from "lucide-react";

export const apps = {
  Pomodoro: {
    name: "Pomodoro",
    shortName: "Pomodoro",
    icon: Timer,
    component: Pomodoro,
    maxInstances: 1,
  },
  MarkdownNotes: {
    name: "Notas Markdown",
    shortName: "Notas",
    icon: NotebookPen,
    component: MarkdownNotes,
    maxInstances: 1,
  },
  CodeSnippets: {
    name: "Snippets de Código",
    shortName: "Snippets",
    icon: Code2,
    component: CodeSnippets,
    maxInstances: 1,
  },
  JSONTools: {
    name: "Ferramentas JSON",
    shortName: "JSON",
    icon: Braces,
    component: JSONTools,
    maxInstances: 1,
  },
  CommandCenter: {
    name: "Central de Comandos",
    shortName: "Comandos",
    icon: TerminalSquare,
    component: CommandCenter,
    maxInstances: 1,
  },
  KnowledgeBase: {
    name: "Base de Conhecimento (BETA)",
    shortName: "Conhecimento",
    icon: Brain,
    component: KnowledgeBase,
    maxInstances: 1,
  },
  KanbanBoard: {
    name: "Quadro Kanban (Em construção)",
    icon: Kanban,
    shortName: "Kanban",
    component: KanbanBoard,
    maxInstances: 1,
  },
} as const;

export type appsType = typeof apps;

export type AppKey = keyof appsType;
