"use client";

import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { useAppTranslations } from "@/hooks/useTranslations";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit2, GripVertical, PlusCircle, Trash2 } from "lucide-react";
import {
  KanbanCard as KanbanCardType,
  KanbanColumn as KanbanColumnType,
} from "../types";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
  column: KanbanColumnType;
  cards: KanbanCardType[];
  onAddCard: (columnId: string) => void;
  onEditCard: (card: KanbanCardType) => void;
  onDeleteCard: (cardId: string, cardTitle: string) => void;
  onToggleSubtask: (cardId: string, subtaskId: string) => void;
  onEditColumn: (column: KanbanColumnType) => void;
  onDeleteColumn: (columnId: string, columnTitle: string) => void;
}

export function KanbanColumn({
  column,
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onToggleSubtask,
  onEditColumn,
  onDeleteColumn,
}: KanbanColumnProps) {
  const t = useAppTranslations("kanbanBoard");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "Column" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-72 md:w-80 bg-muted rounded-lg flex flex-col h-full flex-shrink-0 shadow"
    >
      <div className="p-3 border-b border-border flex justify-between items-center">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-1 -ml-1 mr-1 cursor-grab opacity-60 hover:opacity-100"
          title={t("column.actions.move")}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <h3
          className="font-semibold text-sm text-foreground truncate"
          title={column.title}
        >
          {column.title}
        </h3>
        <div className="flex items-center">
          <span className="text-xs text-muted-foreground mr-2">
            ({cards.length})
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => onEditColumn(column)}
            title={t("column.actions.edit")}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/15 hover:text-black"
            onClick={() => onDeleteColumn(column.id, column.title)}
            title={t("column.actions.delete")}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-grow p-2.5 space-y-3 overflow-y-auto">
        <SortableContext
          id={column.id}
          items={cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
              onToggleSubtask={onToggleSubtask}
            />
          ))}
        </SortableContext>
        {cards.length === 0 && (
          <p className="text-xs text-muted-foreground italic text-center py-4">
            {t("column.empty")}
          </p>
        )}
      </ScrollArea>

      <div className="p-2.5 border-t border-border mt-auto">
        <Button
          onClick={() => onAddCard(column.id)}
          variant="outline"
          size="sm"
          className="w-full justify-start bg-background/80"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> {t("column.newCard")}
        </Button>
      </div>
    </div>
  );
}
