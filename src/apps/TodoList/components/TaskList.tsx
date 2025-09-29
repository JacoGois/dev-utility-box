"use client";

import { useAppTranslations } from "@/hooks/useTranslations";
import { Task, TodoListAction } from "../types";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  dispatch: React.Dispatch<TodoListAction>;
  parentId?: string | null;
}

export function TaskList({ tasks, dispatch, parentId }: TaskListProps) {
  const t = useAppTranslations("todo");

  if (tasks.length === 0 && !parentId) {
    return (
      <div className="text-center text-muted-foreground py-8">{t("empty")}</div>
    );
  }

  return (
    <div className="space-y-1">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} dispatch={dispatch} />
      ))}
    </div>
  );
}
