import { Auth } from "@/apps/Auth";
import { DataGenerator } from "@/apps/DataGenerator";
import { EncodersDecoders } from "@/apps/EncodersDecoders";
import { ImageTextLab } from "@/apps/ImageTextLab";
import { JSONTools } from "@/apps/JSONTools";
import { KanbanBoard } from "@/apps/KanbanBoard";
import { KnowledgeBase } from "@/apps/KnowledgeBase";
import { MassDataGenerator } from "@/apps/MassDataGenerator";
import { Pomodoro } from "@/apps/Pomodoro";
import { TodoList } from "@/apps/TodoList";
import {
  Braces,
  Brain,
  Combine,
  Database,
  FileImage,
  FileJson,
  Kanban as KanbanIcon,
  NotebookPen,
  Timer,
  User,
} from "lucide-react";

export const createApps = (t: (key: string) => string) => ({
  Auth: {
    name: t("apps.auth.name"),
    shortName: t("apps.auth.shortName"),
    icon: User,
    component: Auth,
    maxInstances: 2,
    maxWidth: 550,
    maxHeight: 850,
    minHeight: undefined,
  },
  Pomodoro: {
    name: t("apps.pomodoro.name"),
    shortName: t("apps.pomodoro.shortName"),
    icon: Timer,
    component: Pomodoro,
    maxInstances: 1,
    maxWidth: undefined,
    maxHeight: undefined,
    minHeight: undefined,
  },
  Todo: {
    name: t("apps.todo.name"),
    shortName: t("apps.todo.shortName"),
    icon: NotebookPen,
    component: TodoList,
    maxInstances: 2,
    maxWidth: undefined,
    maxHeight: undefined,
    minHeight: undefined,
  },
  JSONTools: {
    name: t("apps.jsonTools.name"),
    shortName: t("apps.jsonTools.shortName"),
    icon: Braces,
    component: JSONTools,
    maxInstances: 4,
    maxWidth: undefined,
    maxHeight: undefined,
    minHeight: undefined,
  },
  EncodersDecoders: {
    name: t("apps.encoders.name"),
    shortName: t("apps.encoders.shortName"),
    icon: Combine,
    component: EncodersDecoders,
    maxInstances: 4,
    maxWidth: undefined,
    maxHeight: undefined,
    minHeight: 500,
  },
  KnowledgeBase: {
    name: t("apps.knowledgeBase.name"),
    shortName: t("apps.knowledgeBase.shortName"),
    icon: Brain,
    component: KnowledgeBase,
    maxInstances: 1,
    maxWidth: undefined,
    maxHeight: undefined,
    minHeight: undefined,
  },
  DataGenerator: {
    name: t("apps.dataGenerator.name"),
    shortName: t("apps.dataGenerator.shortName"),
    icon: Database,
    component: DataGenerator,
    maxInstances: 2,
    maxWidth: undefined,
    maxHeight: undefined,
    minHeight: undefined,
  },
  MassDataGenerator: {
    name: t("apps.massDataGenerator.name"),
    shortName: t("apps.massDataGenerator.shortName"),
    icon: FileJson,
    component: MassDataGenerator,
    maxInstances: 4,
    maxWidth: undefined,
    maxHeight: undefined,
    minHeight: undefined,
  },
  Kanban: {
    name: t("apps.kanban.name"),
    shortName: t("apps.kanban.shortName"),
    icon: KanbanIcon,
    component: KanbanBoard,
    maxInstances: 3,
    maxWidth: undefined,
    maxHeight: undefined,
    minHeight: undefined,
  },
  ImageTextLab: {
    name: t("apps.imageTextLab.name"),
    shortName: t("apps.imageTextLab.shortName"),
    icon: FileImage,
    component: ImageTextLab,
    maxInstances: 2,
    maxWidth: undefined,
    maxHeight: undefined,
    minHeight: 500,
  },
});

export const apps = createApps(() => "");

export type appsType = ReturnType<typeof createApps>;
export type AppKey = keyof appsType;
