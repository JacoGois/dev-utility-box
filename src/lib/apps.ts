// import { CodeSnippets } from "@/apps/CodeSnippets";
// import { CommandCenter } from "@/apps/CommandCenter";
// import { JSONTools } from "@/apps/JSONTools";
// import { KanbanBoard } from "@/apps/KanbanBoard";
// import { KnowledgeBase } from "@/apps/KnowledgeBase";
// import { MarkdownNotes } from "@/apps/MarkdownNotes";
import { Auth } from "@/apps/Auth";
import { DataGenerator } from "@/apps/DataGenerator";
import { JSONTools } from "@/apps/JSONTools";
import { Pomodoro } from "@/apps/Pomodoro";
// import { TodoList } from "@/apps/TodoList";
import {
  Braces,
  FileJson,
  // NotebookPen,
  // Braces,
  // Brain,
  // Code2,
  // Kanban,
  // NotebookPen,
  // TerminalSquare,
  Timer,
  User,
} from "lucide-react";

export const apps = {
  Pomodoro: {
    name: "Pomodoro",
    shortName: "Pomodoro",
    icon: Timer,
    component: Pomodoro,
    maxInstances: 1,
    maxWidth: undefined,
    maxHeight: undefined,
  },
  Auth: {
    name: "Autenticação",
    shortName: "Autenticação",
    icon: User,
    component: Auth,
    maxInstances: 2,
    maxWidth: 550,
    maxHeight: 850,
  },
  JSONTools: {
    name: "Ferramentas JSON",
    shortName: "JSON",
    icon: Braces,
    component: JSONTools,
    maxInstances: 4,
    maxWidth: undefined,
    maxHeight: undefined,
  },
  DataGenerator: {
    name: "Gerador de Dados",
    shortName: "Gerador",
    icon: FileJson,
    component: DataGenerator,
    maxInstances: 4,
    maxWidth: undefined,
    maxHeight: undefined,
  },
  // Todo: {
  //   name: "To Do List",
  //   shortName: "To Do",
  //   icon: NotebookPen,
  //   component: TodoList,
  // },
  // CodeSnippets: {
  //   name: "Snippets de Código",
  //   shortName: "Snippets",
  //   icon: Code2,
  //   component: CodeSnippets,
  //   maxInstances: 1,
  // },
  // CommandCenter: {
  //   name: "Central de Comandos",
  //   shortName: "Comandos",
  //   icon: TerminalSquare,
  //   component: CommandCenter,
  //   maxInstances: 1,
  // },
  // KnowledgeBase: {
  //   name: "Base de Conhecimento (BETA)",
  //   shortName: "Conhecimento",
  //   icon: Brain,
  //   component: KnowledgeBase,
  //   maxInstances: 1,
  // },
  // KanbanBoard: {
  //   name: "Quadro Kanban (Em construção)",
  //   icon: Kanban,
  //   shortName: "Kanban",
  //   component: KanbanBoard,
  //   maxInstances: 1,
  // },
} as const;

export type appsType = typeof apps;

export type AppKey = keyof appsType;
