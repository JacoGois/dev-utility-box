import { DataGenerator } from "@/apps/DataGenerator";
import { EncodersDecoders } from "@/apps/EncodersDecoders";
import { JSONTools } from "@/apps/JSONTools";
import { KnowledgeBase } from "@/apps/KnowledgeBase";
import { MassDataGenerator } from "@/apps/MassDataGenerator";
import { Pomodoro } from "@/apps/Pomodoro";
import { TodoList } from "@/apps/TodoList";
import {
  Braces,
  Brain,
  Combine,
  Database,
  FileJson,
  NotebookPen,
  Timer,
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
    minHeight: undefined,
  },
  Todo: {
    name: "To Do List",
    shortName: "To Do",
    icon: NotebookPen,
    component: TodoList,
  },
  JSONTools: {
    name: "Ferramentas JSON",
    shortName: "JSON",
    icon: Braces,
    component: JSONTools,
    maxInstances: 4,
    maxWidth: undefined,
    maxHeight: undefined,
    minHeight: undefined,
  },
  EncodersDecoders: {
    name: "Encoders / Decoders",
    shortName: "Codificadores",
    icon: Combine,
    component: EncodersDecoders,
    maxInstances: 4,
    maxWidth: undefined,
    maxHeight: undefined,
    minHeight: 500,
  },
  KnowledgeBase: {
    name: "Base de Conhecimento (BETA)",
    shortName: "Conhecimento",
    icon: Brain,
    component: KnowledgeBase,
    maxInstances: 1,
  },
  DataGenerator: {
    name: "Gerador de Dados",
    shortName: "Gerador Dados",
    icon: Database,
    component: DataGenerator,
    maxInstances: 2,
    maxWidth: undefined,
    maxHeight: undefined,
    minHeight: undefined,
  },
  MassDataGenerator: {
    name: "Gerador de Dados em Massa",
    shortName: "Gerador Dados Massa",
    icon: FileJson,
    component: MassDataGenerator,
    maxInstances: 4,
    maxWidth: undefined,
    maxHeight: undefined,
    minHeight: undefined,
  },
  // Auth: {
  //   name: "Autenticação",
  //   shortName: "Autenticação",
  //   icon: User,
  //   component: Auth,
  //   maxInstances: 2,
  //   maxWidth: 550,
  //   maxHeight: 850,
  // },
  // RegexBuilder: {
  //   name: "Construtor de Regex",
  //   shortName: "Regex",
  //   icon: Puzzle,
  //   component: RegexBuilder,
  //   maxInstances: 2,
  //   maxWidth: undefined,
  //   maxHeight: undefined,
  //   minHeight: undefined,
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
