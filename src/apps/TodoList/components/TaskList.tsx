"use client";

import { Task, TodoListAction } from "../types";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  dispatch: React.Dispatch<TodoListAction>;
  parentId?: string | null;
}

export function TaskList({ tasks, dispatch }: TaskListProps) {
  return (
    <div className="space-y-1">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} dispatch={dispatch} />
      ))}
    </div>
  );
}
