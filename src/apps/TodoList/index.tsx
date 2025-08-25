"use client";

import { usePersistentAppStore } from "@/hooks/usePersistentAppStore";
import { faker } from "@faker-js/faker";
import React, { useEffect, useReducer } from "react";
import { AddTaskForm } from "./components/AddTaskForm";
import { TaskList } from "./components/TaskList";
import { Task, TodoListAction, TodoListState } from "./types";

export const defaultState: TodoListState = {
  tasks: [],
};

const removeTaskRecursive = (tasks: Task[], id: string): Task[] => {
  return tasks
    .filter((task) => task.id !== id)
    .map((task) => ({
      ...task,
      children: task.children ? removeTaskRecursive(task.children, id) : [],
    }));
};

const updateTaskRecursive = (
  tasks: Task[],
  id: string,
  updates: Partial<Omit<Task, "id">>
): Task[] => {
  return tasks.map((task) => {
    if (task.id === id) return { ...task, ...updates };
    return {
      ...task,
      children: task.children
        ? updateTaskRecursive(task.children, id, updates)
        : [],
    };
  });
};

const addTaskRecursive = (
  tasks: Task[],
  newTask: Task,
  parentId: string | null
): Task[] => {
  if (parentId === null) {
    return [...tasks, newTask];
  }
  return tasks.map((task) => {
    if (task.id === parentId) {
      return { ...task, children: [...task.children, newTask] };
    }
    return {
      ...task,
      children: task.children
        ? addTaskRecursive(task.children, newTask, parentId)
        : [],
    };
  });
};

function todoListReducer(
  state: TodoListState,
  action: TodoListAction
): TodoListState {
  switch (action.type) {
    case "ADD_TASK":
      const newTask: Task = {
        id: faker.string.uuid(),
        parentId: action.payload.parentId,
        title: action.payload.title,
        description: "",
        completed: false,
        priority: "none",
        children: [],
      };
      return {
        ...state,
        tasks: addTaskRecursive(state.tasks, newTask, action.payload.parentId),
      };

    case "UPDATE_TASK":
      return {
        ...state,
        tasks: updateTaskRecursive(
          state.tasks,
          action.payload.id,
          action.payload.updates
        ),
      };

    case "DELETE_TASK":
      return {
        ...state,
        tasks: removeTaskRecursive(state.tasks, action.payload.id),
      };

    default:
      return state;
  }
}

function TodoListComponent({ instanceId }: { instanceId: string }) {
  const [persistedState, setPersistedState] = usePersistentAppStore(
    instanceId,
    defaultState
  );
  const [state, dispatch] = useReducer(todoListReducer, persistedState);

  useEffect(() => {
    setPersistedState(state);
  }, [state]);

  return (
    <div className="flex flex-col h-full w-full p-4 bg-card text-card-foreground border-t">
      <AddTaskForm dispatch={dispatch} />
      <div className="flex-grow overflow-auto pr-2">
        <TaskList tasks={state.tasks} dispatch={dispatch} />
      </div>
    </div>
  );
}

const MemoizedTodoList = React.memo(TodoListComponent);
export function TodoList({ instanceId }: { instanceId: string }) {
  return <MemoizedTodoList instanceId={instanceId} />;
}
