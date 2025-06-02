"use client";

import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Edit2, PlusCircle, Trash2 } from "lucide-react";
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
  return (
    <div className="w-72 md:w-80 bg-muted rounded-lg flex flex-col h-full flex-shrink-0 shadow">
      <div className="p-3 border-b border-border flex justify-between items-center">
        {/* <GripVertical className="h-5 w-5 text-muted-foreground/50 mr-1 cursor-grab" />  Ícone para D&D da coluna */}
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
            onClick={() => onEditColumn(column)}
            title="Editar Coluna"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteColumn(column.id, column.title)}
            title="Excluir Coluna"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-grow p-2.5 space-y-3 overflow-y-auto">
        {/* Este será o SortableContext para os cartões */}
        {cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            onEdit={onEditCard}
            onDelete={onDeleteCard}
            onToggleSubtask={onToggleSubtask}
          />
        ))}
        {cards.length === 0 && (
          <p className="text-xs text-muted-foreground italic text-center py-4">
            Nenhum cartão nesta coluna.
          </p>
        )}
      </ScrollArea>

      <div className="p-2.5 border-t border-border mt-auto">
        <Button
          onClick={() => onAddCard(column.id)}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-primary"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Cartão
        </Button>
      </div>
    </div>
  );
}
