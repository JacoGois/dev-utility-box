"use client";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/form/Checkbox";
import { Input } from "@/components/ui/form/Input";
import { Textarea } from "@/components/ui/form/Textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { useAppTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUp,
  Circle,
  MessageSquare,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Priority, Task, TodoListAction } from "../types";
import { AddTaskForm } from "./AddTaskForm";
import { TaskList } from "./TaskList";

interface TaskItemProps {
  task: Task;
  dispatch: React.Dispatch<TodoListAction>;
}

const priorityMap: Record<
  Priority,
  { icon: React.ElementType; color: string }
> = {
  high: { icon: ChevronsUp, color: "text-destructive" },
  medium: { icon: ChevronUp, color: "text-orange-500" },
  low: { icon: ChevronDown, color: "text-sky-500" },
  none: { icon: Circle, color: "text-muted-foreground/50" },
};

export function TaskItem({ task, dispatch }: TaskItemProps) {
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(
    Boolean(task.description)
  );

  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const t = useAppTranslations("todo");

  const handleUpdate = (updates: Partial<Omit<Task, "id">>) => {
    dispatch({ type: "UPDATE_TASK", payload: { id: task.id, updates } });
  };
  const handleDelete = () =>
    dispatch({ type: "DELETE_TASK", payload: { id: task.id } });

  const PriorityIcon = priorityMap[task.priority].icon;

  return (
    <div className="flex flex-col rounded-lg">
      <div className="flex items-start gap-2 p-2 group">
        <div className="pt-1 flex-shrink-0">
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={(checked) =>
              handleUpdate({ completed: !!checked })
            }
          />
        </div>
        <div className="flex-grow space-y-1">
          <Input
            value={task.title}
            onChange={(e) => handleUpdate({ title: e.target.value })}
            className={cn(
              "h-8 border-none focus-visible:ring-1 focus-visible:ring-ring bg-transparent text-base",
              {
                "line-through text-muted-foreground": task.completed,
              }
            )}
          />
          {isDescriptionVisible && (
            <Textarea
              placeholder={t("addDescription")}
              value={task.description}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              className="text-sm text-muted-foreground bg-transparent border-dashed"
            />
          )}
        </div>
        <div className="flex items-center flex-shrink-0 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden group-hover:flex"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 hover:text-white text-foreground " />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden group-hover:flex"
            onClick={() => setIsAddingSubtask(true)}
          >
            <PlusCircle className="h-4 w-4 hover:text-white text-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden group-hover:flex"
            onClick={() => setIsDescriptionVisible(!isDescriptionVisible)}
          >
            <MessageSquare className="h-4 w-4 hover:text-white text-foreground" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <PriorityIcon
                  className={cn("h-4 w-4", priorityMap[task.priority].color)}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-0 z-[999999999]">
              {Object.keys(priorityMap).map((p) => {
                const priority = p as Priority;
                const ItemIcon = priorityMap[priority].icon;
                return (
                  <Button
                    key={priority}
                    variant="ghost"
                    className="justify-start w-full"
                    onClick={() => handleUpdate({ priority })}
                  >
                    {" "}
                    <ItemIcon
                      className={cn(
                        "h-4 w-4 mr-2",
                        priorityMap[priority].color
                      )}
                    />
                    {t(`priorities.${priority}`)}
                  </Button>
                );
              })}
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="pl-12">
        {isAddingSubtask && (
          <div className="mb-2">
            <AddTaskForm
              dispatch={dispatch}
              parentId={task.id}
              onTaskAdded={() => setIsAddingSubtask(false)}
            />
          </div>
        )}
        <TaskList
          tasks={task.children}
          dispatch={dispatch}
          parentId={task.id}
        />
      </div>
    </div>
  );
}
