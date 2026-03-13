"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/form/Checkbox";
import { Progress } from "@/components/ui/Progress";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { useAppTranslations } from "@/hooks/useTranslations";
import { hexToRgba } from "@/lib/color";
import { cn } from "@/lib/utils";
import { useKanbanStore } from "@/stores/useKanbanStore";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { truncate } from "lodash";
import {
  AlertTriangle,
  CalendarDays,
  Edit2,
  Flag,
  GripVertical,
  Trash2,
} from "lucide-react";
import { KanbanCard as KanbanCardType } from "../types";
const resolvePriority = (priority: unknown): 0 | 1 | 2 | 3 => {
  if (priority === "P0") return 0;
  if (priority === "P1") return 1;
  if (priority === "P2") return 2;
  if (priority === "P3") return 3;
  if (typeof priority === "number" && priority >= 0 && priority <= 3) {
    return priority as 0 | 1 | 2 | 3;
  }
  return 2;
};

interface KanbanCardProps {
  card: KanbanCardType;
  onEdit: (card: KanbanCardType) => void;
  onDelete: (cardId: string, cardTitle: string) => void;
  onToggleSubtask: (cardId: string, subtaskId: string) => void;
}

export function KanbanCard({
  card,
  onEdit,
  onDelete,
  onToggleSubtask,
}: KanbanCardProps) {
  const t = useAppTranslations("kanbanBoard");
  const completedSubtasks = card.subtasks.filter((st) => st.isCompleted).length;
  const subtaskProgress =
    card.subtasks.length === 0
      ? 0
      : Math.round((completedSubtasks / card.subtasks.length) * 100);
  const todayIso = new Date().toISOString().slice(0, 10);
  const isOverdue = Boolean(card.dueDate && card.dueDate < todayIso);
  const globalTags = useKanbanStore((state) => state.tags);

  const resolvedPriority = resolvePriority(card.priority);
  const priorityStyle = {
    0: {
      label: t("priorities.critical"),
      bg: "bg-rose-500/15",
      text: "text-rose-600",
      border: "border-rose-500/30",
    },
    1: {
      label: t("priorities.high"),
      bg: "bg-orange-500/15",
      text: "text-orange-600",
      border: "border-orange-500/30",
    },
    2: {
      label: t("priorities.medium"),
      bg: "bg-blue-500/15",
      text: "text-blue-600",
      border: "border-blue-500/30",
    },
    3: {
      label: t("priorities.low"),
      bg: "bg-emerald-500/15",
      text: "text-emerald-600",
      border: "border-emerald-500/30",
    },
  }[resolvedPriority];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: "Card", card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 100 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "@container bg-card p-3 rounded-md shadow border",
        isDragging && "shadow-xl ring-2 ring-primary",
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-semibold break-words text-card-foreground pr-1">
          {card.title}
        </h4>
        <div className="flex-shrink-0 flex items-center">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab p-1 -ml-1 opacity-50 hover:opacity-100"
            title={t("card.actions.move")}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <div className="flex ml-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => onEdit(card)}
              title={t("card.actions.edit")}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:bg-destructive/15 hover:text-black"
              onClick={() => onDelete(card.id, card.title)}
              title={t("card.actions.delete")}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {card.description && (
        <p className="text-xs text-muted-foreground mb-2 break-words whitespace-pre-wrap">
          {card.description}
        </p>
      )}

      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Badge
          variant="outline"
          className={cn("gap-1 border text-[10px]", priorityStyle.bg, priorityStyle.text, priorityStyle.border)}
        >
          <Flag className="h-3 w-3" />
          {priorityStyle.label}
        </Badge>
        {card.dueDate && (
          <Badge
            variant="outline"
            className={cn(
              "gap-1 border text-[10px]",
              isOverdue
                ? "border-rose-500/40 bg-rose-500/15 text-rose-600"
                : "border-amber-500/40 bg-amber-500/15 text-amber-700"
            )}
          >
            {isOverdue ? (
              <AlertTriangle className="h-3 w-3" />
            ) : (
              <CalendarDays className="h-3 w-3" />
            )}
            {card.dueDate}
          </Badge>
        )}
      </div>

      {card.subtasks.length > 0 && (
        <div className="mb-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              {t("card.subtasksProgress", {
                completed: completedSubtasks,
                total: card.subtasks.length,
              })}
            </p>
            <span className="text-[10px] text-muted-foreground">{subtaskProgress}%</span>
          </div>
          <Progress value={subtaskProgress} className="h-1.5" />
          <ScrollArea className="max-h-[100px] pr-2">
            {card.subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-2 py-0.5">
                <Checkbox
                  id={`subtask-${card.id}-${subtask.id}`}
                  checked={subtask.isCompleted}
                  onCheckedChange={() => onToggleSubtask(card.id, subtask.id)}
                  className="w-3.5 h-3.5"
                />
                <label
                  htmlFor={`subtask-${card.id}-${subtask.id}`}
                  className={cn(
                    "text-xs cursor-pointer",
                    subtask.isCompleted && "line-through text-muted-foreground",
                  )}
                >
                  {truncate(subtask.text, { length: 40 })}
                </label>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}

      {(card.links?.branch || card.links?.commit || card.links?.pr) && (
        <div className="mb-2 space-y-0.5 text-xs text-muted-foreground/80">
          {card.links.branch && (
            <p className="truncate flex items-center">
              <strong className="mr-1">{t("card.links.branch")}:</strong>{" "}
              {card.links.branch}
            </p>
          )}
          {card.links.commit && (
            <p className="truncate flex items-center">
              <strong className="mr-1">{t("card.links.commit")}:</strong>
              {card.links.commit.startsWith("http") ? (
                <a
                  href={card.links.commit}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {card.links.commit}
                </a>
              ) : (
                card.links.commit
              )}
            </p>
          )}
          {card.links.pr && (
            <p className="truncate flex items-center">
              <strong className="mr-1">{t("card.links.pr")}:</strong>
              <a
                href={card.links.pr}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {card.links.pr}
              </a>
            </p>
          )}
        </div>
      )}

      {card.tagIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.tagIds.map((tagId) => {
            const tag = globalTags[tagId];
            return tag ? (
              <Badge
                key={tag.id}
                variant="secondary"
                className="border text-xs px-1.5 py-0.5"
                style={
                  tag.color
                    ? {
                        backgroundColor: hexToRgba(tag.color, 0.16),
                        borderColor: hexToRgba(tag.color, 0.55),
                        color: tag.color,
                      }
                    : undefined
                }
              >
                {tag.name}
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
