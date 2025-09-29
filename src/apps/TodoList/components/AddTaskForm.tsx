"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/form/Input";
import { useAppTranslations } from "@/hooks/useTranslations";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { TodoListAction } from "../types";

interface AddTaskFormProps {
  dispatch: React.Dispatch<TodoListAction>;
  parentId?: string | null;
  onTaskAdded?: () => void;
}

export function AddTaskForm({
  dispatch,
  parentId = null,
  onTaskAdded,
}: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const t = useAppTranslations('todo');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    dispatch({ type: "ADD_TASK", payload: { title, parentId } });
    setTitle("");
    onTaskAdded?.();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={
          parentId ? t("addSubtask") : t("placeholder")
        }
        autoFocus
      />
      <Button type="submit" size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
}
