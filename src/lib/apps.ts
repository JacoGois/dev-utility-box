import { DataGenerator } from "@/apps/DataGenerator";
import { EncodersDecoders } from "@/apps/EncodersDecoders";
import { JSONTools } from "@/apps/JSONTools";
import { Pomodoro } from "@/apps/Pomodoro";
import { Braces, Combine, FileJson, Timer } from "lucide-react";

export const apps = {
  // Auth: {
  //   name: "Autenticação",
  //   shortName: "Autenticação",
  //   icon: User,
  //   component: Auth,
  //   maxInstances: 2,
  //   maxWidth: 550,
  //   maxHeight: 850,
  // },
  Pomodoro: {
    name: "Pomodoro",
    shortName: "Pomodoro",
    icon: Timer,
    component: Pomodoro,
    maxInstances: 1,
    maxWidth: undefined,
    maxHeight: undefined,
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
  EncodersDecoders: {
    name: "Encoders / Decoders",
    shortName: "Codificadores",
    icon: Combine,
    component: EncodersDecoders,
    maxInstances: 4,
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
