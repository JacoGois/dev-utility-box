"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { cn } from "@/lib/utils";
import { useKanbanStore } from "@/stores/useKanbanStore";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit2, GripVertical, Trash2 } from "lucide-react";
import { KanbanCard as KanbanCardType } from "../types";

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
  const completedSubtasks = card.subtasks.filter((st) => st.isCompleted).length;
  const { tags: globalTags } = useKanbanStore((state) => ({
    tags: state.tags,
  }));

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
        "bg-card p-3 rounded-md shadow border",
        isDragging && "shadow-xl ring-2 ring-primary"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-semibold break-words text-card-foreground pr-1">
          {card.title}
        </h4>
        <div className="flex-shrink-0 flex items-center">
          {/* Botão de arrastar (opcional, pode arrastar pelo card inteiro) */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab p-1 -ml-1 opacity-50 hover:opacity-100"
            title="Mover cartão"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <div className="flex ml-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(card)}
              title="Editar Cartão"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(card.id, card.title)}
              title="Excluir Cartão"
              className="text-destructive hover:text-destructive"
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

      {card.subtasks.length > 0 && (
        <div className="mb-2 space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Sub-tarefas ({completedSubtasks}/{card.subtasks.length})
          </p>
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
                    subtask.isCompleted && "line-through text-muted-foreground"
                  )}
                >
                  {subtask.text}
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
              <strong className="mr-1">Branch:</strong> {card.links.branch}
            </p>
          )}
          {card.links.commit && (
            <p className="truncate flex items-center">
              <strong className="mr-1">Commit:</strong>
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
              <strong className="mr-1">PR:</strong>
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
                className="text-xs px-1.5 py-0.5"
                style={{ backgroundColor: tag.color /* se tiver cor na tag */ }}
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
