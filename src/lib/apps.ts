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

export const createApps = (t: (key: string) => string) => ({
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
});

export const apps = createApps(() => "");

export type appsType = ReturnType<typeof createApps>;
export type AppKey = keyof appsType;
