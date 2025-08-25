export type Priority = "none" | "low" | "medium" | "high";

export interface Task {
  id: string;
  parentId: string | null;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  children: Task[];
}

export type TasksTree = Task[];

export interface TodoListState {
  tasks: TasksTree;
}

export type TodoListAction =
  | { type: "ADD_TASK"; payload: { title: string; parentId: string | null } }
  | {
      type: "UPDATE_TASK";
      payload: { id: string; updates: Partial<Omit<Task, "id">> };
    }
  | { type: "DELETE_TASK"; payload: { id: string } };
