import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

type TranslateFn = (key: string) => string;
const fallbackTranslate: TranslateFn = (key) => key;

const createColumnSchema = (t: TranslateFn) =>
  z.object({
    title: z
      .string()
      .trim()
      .min(1, t("validation.columnTitleRequired")),
  });

const createCardSchema = (t: TranslateFn) =>
  z.object({
    title: z
      .string()
      .trim()
      .min(1, t("validation.cardTitleRequired")),
    description: z.string().optional(),
    priority: z.number().int().min(0).max(3),
    dueDate: z
      .string()
      .optional()
      .refine(
        (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
        t("validation.invalidDueDate"),
      ),
    linkBranch: z.string().optional(),
    linkCommit: z.string().optional(),
    linkPR: z.string().optional(),
  });

const createTagSchema = (t: TranslateFn) =>
  z.object({
    name: z.string().trim().min(1, t("validation.tagNameRequired")),
    color: z
      .string()
      .optional()
      .refine(
        (value) =>
          !value ||
          value.trim() === "" ||
          /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(value.trim()),
        t("validation.invalidColor"),
      ),
  });

export type KanbanColumnFormValues = z.infer<
  ReturnType<typeof createColumnSchema>
>;
export type KanbanCardFormValues = z.infer<ReturnType<typeof createCardSchema>>;
export type KanbanTagFormValues = z.infer<ReturnType<typeof createTagSchema>>;

export const defaultKanbanColumnValues: KanbanColumnFormValues = {
  title: "",
};

export const defaultKanbanCardValues: KanbanCardFormValues = {
  title: "",
  description: "",
  priority: 2,
  dueDate: "",
  linkBranch: "",
  linkCommit: "",
  linkPR: "",
};

export const defaultKanbanTagValues: KanbanTagFormValues = {
  name: "",
  color: "",
};

export const useKanbanColumnForm = (t: TranslateFn = fallbackTranslate) =>
  useForm<KanbanColumnFormValues>({
    resolver: zodResolver(createColumnSchema(t)),
    defaultValues: defaultKanbanColumnValues,
    mode: "onSubmit",
  });

export const useKanbanCardForm = (t: TranslateFn = fallbackTranslate) =>
  useForm<KanbanCardFormValues>({
    resolver: zodResolver(createCardSchema(t)),
    defaultValues: defaultKanbanCardValues,
    mode: "onSubmit",
  });

export const useKanbanTagForm = (t: TranslateFn = fallbackTranslate) =>
  useForm<KanbanTagFormValues>({
    resolver: zodResolver(createTagSchema(t)),
    defaultValues: defaultKanbanTagValues,
    mode: "onSubmit",
  });
